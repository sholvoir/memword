// deno-lint-ignore-file no-cond-assign no-explicit-any
/// <reference lib="webworker" />

import { type Tag } from "@sholvoir/vocabulary";
import { requestInit, ok, notFound, badRequest, responseInit } from 'jsr:@sholvoir/generic@^0.0.5/http';
import { ITask, MAX_NEXT, TaskType, TaskTypes } from "./itask.ts";
import { IDiction } from "./idict.ts";
import { initStats, adjTaskToStats, IStats, BLevel, bLevelIncludes, statsFormat } from './istat.ts';
import { IMessage } from './imessage.ts';
import { defaultSetting, settingFormat } from "./isetting.ts";

declare const self: ServiceWorkerGlobalScope;
declare interface Client {
    postMessage(message: IMessage, options?: StructuredSerializeOptions): void;
}

const vocabularyUrl = 'https://www.micit.co/vocabulary/0.0.9/vocabulary.txt';
const revisionUrl = 'https://www.micit.co/vocabulary/0.0.9/revision.txt';
const dictApi = 'https://dict.micit.co/api';
const dictExpire = 7 * 24 * 60 * 60;
const now = () => Math.floor(Date.now() / 1000);

self.oninstall = (e) => {
    e.waitUntil(self.skipWaiting());
};

self.onactivate = (e) => {
    e.waitUntil(self.clients.claim());
};

const g = {
    dictDB: undefined as IDBDatabase | undefined,
    userDB: undefined as IDBDatabase | undefined,
    vocabulary: {} as Record<string, Array<Tag>>,
    revision: {} as Record<string, string>,
    setting: defaultSetting(),
    stats: initStats(),
    updateStatsTimer: undefined as number | undefined,
    page: null as Client | ServiceWorker | MessagePort | null
};

const clearUpdateStatsTimer = () => {
    if (g.updateStatsTimer) {
        clearTimeout(g.updateStatsTimer);
        g.updateStatsTimer = undefined;
    }
};

const openDictDB = () => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('dict', 1);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => request.result.createObjectStore('dict', { keyPath: 'word' });
});

const getDiction = (word: string) => new Promise<IDiction | undefined>((resolve, reject) => {
    const request = g.dictDB!.transaction('dict', 'readonly').objectStore('dict').get(word);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

const putDiction = (diction: IDiction) => new Promise<void>((resolve, reject) => {
    const request = g.dictDB!.transaction('dict', 'readwrite').objectStore('dict').put(diction);
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

const fetchDiction = async (word: string) => {
    const resp1 = await fetch(`${dictApi}/${encodeURIComponent(word)}`, { cache: 'reload' });
    if (!resp1.ok) return undefined;
    const dict: IDiction = await resp1.json();
    dict.word = word;
    dict.version = now();
    return dict;
}

const openUserDB = (user: string) => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(user, 1);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
        const db = request.result;
        const kvStore = db.createObjectStore('kv', { keyPath: 'key' });
        kvStore.put({ key: '_vocabulary-url', value: '' });
        kvStore.put({ key: '_sync-time', value: 0 });
        kvStore.put({ key: '_setting', value: defaultSetting() });
        kvStore.put({ key: '_stats', value: initStats() });
        const taskStore = db.createObjectStore('task', { keyPath: ['type', 'word'] });
        taskStore.createIndex('last', 'last');
        taskStore.createIndex('next', 'next');
    };
});

const getKv = async (key: string) => await new Promise<any>((resolve, reject) => {
    const request = g.userDB!.transaction('kv', 'readonly').objectStore('kv').get(key);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result.value);
});

const setKv = async (key: string, value: any) => await new Promise<void>((resolve, reject) => {
    const request = g.userDB!.transaction('kv', 'readwrite').objectStore('kv').put({ key, value });
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

const getTask = (type: TaskType, word: string) => new Promise<ITask>((resolve, reject) => {
    const request = g.userDB!.transaction('task', 'readonly').objectStore('task').get([type, word]);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

const putTask = (task: ITask) => new Promise<void>((resolve, reject) => {
    const request = g.userDB!.transaction('task', 'readwrite').objectStore('task').put(task);
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

const deleteTask = async (task: ITask) => {
    task.last = MAX_NEXT;
    task.next = MAX_NEXT;
    await putTask(task);
};

const addTasks = (types: string, tag: Tag) => new Promise<void>((resolve, reject) => {
    const time = now();
    const transaction = g.userDB!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    for (const type of types) for (const word in g.vocabulary) {
        if (g.vocabulary[word]?.includes(tag)) objectStore.get([type, word]).onsuccess = (e) => {
            if (!(e.target as IDBRequest).result) {
                const task: ITask = { type: type as TaskType, word, last: time, next: 0, level: 0 };
                const tags = g.vocabulary[task.word];
                objectStore.add(task);
                adjTaskToStats(task, g.stats, tags, 1);
            }
        }
    }
});

const getEpisode = (types?: string, tag?: Tag, blevel?: BLevel) => new Promise<Array<ITask>>((resolve, reject) => {
    const tasks: Array<ITask> = [];
    const request = g.userDB!.transaction('task', 'readonly').objectStore('task')
        .index('next').openCursor(IDBKeyRange.upperBound(now()), "prev");
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return resolve(tasks);
        const task = cursor.value as ITask;
        if ((!types || types.includes(task.type))
            && (!tag || g.vocabulary[task.word]?.includes(tag))
            && (!blevel || bLevelIncludes(blevel, task.level)))
            tasks.push(task);
        if (tasks.length < g.setting.sprint) cursor.continue();
        else resolve(tasks);
    }
});

const getTasks = (last: number) => new Promise<Array<ITask>>((resolve, reject) => {
    const request = g.userDB!.transaction('task', 'readonly').objectStore('task').index('last').getAll(IDBKeyRange.lowerBound(last));
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

const putTasks = (tasks: Array<ITask>) => new Promise<void>((resolve, reject) => {
    const transaction = g.userDB!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    for (const ntask of tasks) {
        delete ntask._id;
        const key = [ntask.type, ntask.word];
        if (ntask.last == MAX_NEXT) objectStore.delete(key);
        else objectStore.get(key).onsuccess = (e) => {
            const otask = (e.target as IDBRequest).result as ITask;
            if (!otask || ntask.last > otask.last) objectStore.put(ntask);
        };
    }
});

const syncTasks = async (lastTime?: number) => {
    const thisTime = now();
    if (!lastTime) lastTime = await getKv('_sync-time') as number;
    const resp = await fetch(`/task?lastgt=${lastTime}`, requestInit(await getTasks(lastTime)));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await putTasks(ntasks);
    await setKv('_sync-time', thisTime);
};

const clarifyTasks = () => new Promise<void>((resolve, reject) => {
    const request = g.userDB!.transaction('task', 'readwrite').objectStore('task').openCursor();
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return resolve();
        const task = cursor.value as ITask;
        let modified = false;
        if (task.level > 15) {
            task.level = 15;
            modified = true;
        }
        if (!g.vocabulary[task.word]) {
            task.last = now();
            task.next = MAX_NEXT;
            modified = true;
        }
        if (modified) cursor.update(task);
        cursor.continue();
    }
});

const updateStats = () => new Promise<void>((resolve, reject) => {
    clearUpdateStatsTimer();
    const nstats: IStats = { ...g.stats, time: now() };
    const request = g.userDB!.transaction('task', 'readonly').objectStore('task')
        .index('last').openCursor(IDBKeyRange.bound(g.stats.time, nstats.time));
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
            g.page?.postMessage({ type: 'stats', data: (g.stats = nstats) });
            setKv('_stats', g.stats).then(() => g.updateStatsTimer = setTimeout(updateStats, 5*60*1000));
            return resolve();
        }
        const task = cursor.value as ITask;
        const tags = g.vocabulary[task.word];
        adjTaskToStats(task, g.stats, tags, -1);
        adjTaskToStats(task, nstats, tags, 1);
        cursor.continue();
    }
});

const totalStats = () => new Promise<IStats>((resolve, reject) => {
    const stats = initStats(now());
    const transaction = g.userDB!.transaction('task', 'readonly');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(stats);
    const objectStore = transaction.objectStore('task');
    for (const type of TaskTypes) for (const word in g.vocabulary)
        objectStore.get([type, word]).onsuccess = (e) => {
            const task = (e.target as IDBRequest).result as ITask ?? { type, word, last: 0, next: MAX_NEXT, level: 0 };
            adjTaskToStats(task, stats, g.vocabulary[word], 1);
        }
});

const fetchDict = async (req: Request) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return badRequest;
    const res = (d: IDiction) => new Response(JSON.stringify(d), responseInit);
    let dict: IDiction | undefined = undefined;
    if (req.cache == 'reload') {
        dict = await fetchDiction(word);
        if (dict) {
            putDiction(dict);
            return res(dict);
        } else {
            dict = await getDiction(word);
            return dict ? res(dict) : notFound;
        }
    } else {
        dict = await getDiction(word);
        if (dict) {
            if (dict.version + dictExpire < now())
                fetchDiction(word).then(d => d ? putDiction(d) : undefined);
            return res(dict);
        } else {
            dict = await fetchDiction(word);
            if (!dict) return notFound;
            else {
                putDiction(dict);
                return res(dict)
            }
        }
    }
};

const fetchSearch = async (req: Request) => {
    const rawWord = new URL(req.url).searchParams.get('word');
    if (!rawWord) return badRequest;
    let word = decodeURIComponent(rawWord);
    if (!g.vocabulary[word]) {
        if (!g.revision[word]) {
            if (!g.vocabulary[word.toLowerCase()]) {
                if (!g.revision[word.toLowerCase()]) return badRequest;
                else word = g.revision[word.toLowerCase()];
            } else word = word.toLowerCase();
        } else word = g.revision[word];
    }
    let task = await getTask('R', word);
    if (!task) {
        task = { type: 'R', word, last: now(), next: 0, level: 0 };
        putTask(task);
    }
    return new Response(JSON.stringify(task), responseInit);
};

const putSetting = async (req: Request) => {
    g.setting = await req.json();
    g.setting.unsynced = true;
    setKv('_setting', g.setting).then(() => 
        fetch('/setting', requestInit(g.setting, 'PUT'))).then(res => {
        if (res.ok) {
            delete g.setting.unsynced;
            setKv('_setting', g.setting);
        }
    });
    return ok;
}

const fetchEpisode = async (req: Request) => {
    const url = new URL(req.url);
    const types = url.searchParams.get('types') || undefined;
    const tag = url.searchParams.get('tag') as Tag || undefined;
    const blevel = url.searchParams.get('blevel') as BLevel || undefined;
    return new Response(JSON.stringify(await getEpisode(types, tag, blevel)), responseInit);
}

const fetchAddTasks = (req: Request) => {
    const params = new URL(req.url).searchParams;
    const types = params.get('types');
    const tag = params.get('tag') as Tag;
    if (!types || !tag) return badRequest;
    addTasks(types, tag).then(() => {
        g.page?.postMessage({ type: 'stats', data: g.stats });
        return syncTasks();
    });
    return ok;
}

const postStudy = async (req: Request) => {
    const otask = await req.json() as ITask;
    let level = otask.level;
    return await new Promise<Response>((resolve, reject) => {
        const transaction = g.userDB!.transaction('task', 'readwrite');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve(ok);
        const objectStore = transaction.objectStore('task');
        objectStore.get([otask.type, otask.word]).onsuccess = (e) => {
            const task = (e.target as IDBRequest).result as ITask;
            if (task) {
                const tags = g.vocabulary[task.word];
                adjTaskToStats(task, g.stats, tags, -1);
                if (level >= 15) level = 15;
                else level++
                task.level = level;
                task.last = now();
                task.next = level >= 15 ? MAX_NEXT : task.last + Math.round(39 * level ** 3 * 1.5 ** level);
                objectStore.put(task);
                adjTaskToStats(task, g.stats, tags, 1);
            }
        }
    });
};

self.onfetch = (e) => {
    switch (new URL(e.request.url).pathname) {
        case '/dict': e.respondWith(fetchDict(e.request)); break;
        case '/search': e.respondWith(fetchSearch(e.request)); break;
        case '/setting': e.respondWith(putSetting(e.request)); break;
        case '/episode': e.respondWith(fetchEpisode(e.request)); break;
        case '/update-stats': e.waitUntil(updateStats()); e.respondWith(ok); break;
        case '/delete-task': e.waitUntil(e.request.json().then(deleteTask)); e.respondWith(ok); break;
        case '/sync-tasks': e.waitUntil(syncTasks()); e.respondWith(ok); break;
        case '/add-tasks': e.respondWith(fetchAddTasks(e.request)); break;
        case '/study': e.respondWith(postStudy(e.request)); break;
        default: e.respondWith(fetch(e.request));
    }
};

const init = async ({ user }: { user: string }) => {
    g.dictDB = await openDictDB();
    g.userDB = await openUserDB(user);

    g.setting = await getKv('_setting');
    if (g.setting.format == settingFormat)
        g.page?.postMessage({ type: 'setting', data: g.setting });
    g.stats = await getKv('_stats');
    if (g.stats.format == statsFormat)
        g.page?.postMessage({ type: 'stats', data: g.stats });

    const res2 = await fetch(vocabularyUrl, { cache: 'force-cache' });
    if (res2.ok) {
        const delimiter = /[,:] */;
        for (let line of (await res2.text()).split('\n')) if (line = line.trim()) {
            const [word, ...tags] = line.split(delimiter).map(w=>w.trim());
            g.vocabulary[word] = tags as Array<Tag>;
        }
    }

    const res3 = await fetch(revisionUrl, { cache: 'force-cache' });
    if (res3.ok) {
        const delimiter = /: */;
        for (let line of (await res3.text()).split('\n')) if (line = line.trim()) {
            const [word, replace] = line.split(delimiter);
            g.revision[word] = replace;
        }
    }
    
    const _vocabulary_url = await getKv('_vocabulary-url');
    if (vocabularyUrl !== _vocabulary_url) {
        await clarifyTasks();
        await setKv('_vocabulary-url', vocabularyUrl)
    }
    
    if (g.setting.unsynced) {
        delete g.setting.unsynced;
        const res5 = await fetch('/setting', requestInit(g.setting, 'PUT'));
        if (res5.ok) await setKv('_setting', g.setting);
        else g.setting.unsynced = true;
    } else {
        const res6 = await fetch('/setting');
        if (res6.ok) {
            g.setting = await res6.json();
            g.page?.postMessage({ type: 'setting', data: g.setting });
            await setKv('_setting', g.setting);
        }
    }
    
    await syncTasks();
    g.stats = await totalStats();
    await updateStats();
};

self.onmessage = (e) => {
    switch (e.data.type) {
        case 'init':
            g.page = e.source;
            init(e.data.data);
            break;
        case 'close':
            g.page = null;
            clearUpdateStatsTimer();
            g.userDB?.close();
            g.dictDB?.close();
            break;
        default: return;
    }
}