// deno-lint-ignore-file no-cond-assign
import { type Tag } from "@sholvoir/vocabulary";
import { requestInit } from '@sholvoir/generic/http';
import { type TaskType, ITask, letDelete, letNever, MAX_NEXT, newTask, TASK_TYPES } from "./itask.ts";
import { IDiction } from "./idict.ts";
import { type BLevel, initStats, adjTaskToStats, IStats, bLevelIncludes, statsFormat } from './istat.ts';
import { defaultSetting, ISetting, settingFormat } from "./isetting.ts";

const vocabularyUrl = 'https://www.micit.co/vocabulary/0.0.22/vocabulary.txt';
const dictApi = 'https://dict.micit.co/api';
const dictExpire = 7 * 24 * 60 * 60;

const g = {
    user: '',
    setting: defaultSetting(),
    stats: initStats(),
    dictDB: undefined as IDBDatabase | undefined,
    userDB: undefined as IDBDatabase | undefined,
    vocabulary: {} as Record<string, Array<Tag>>
};

const setVocabularyUrl = (url: string) => localStorage.setItem('_vocabulary_url', url);
const getVocabularyUrl = () => localStorage.getItem('_vocabulary_url');

export const now = () => Math.floor(Date.now() / 1000);
export const syncSetting = async () => {
    const res = await fetch('/setting', requestInit(g.setting));
    if (res.ok) {
        const setting: ISetting = await res.json();
        if (setting.version > g.setting.version) {
            setSetting(g.setting = setting);
            if (worker.onSettingChanged) worker.onSettingChanged(setting);
        }
    }
};

export const setSetting = (setting: ISetting) => localStorage.setItem('_setting', JSON.stringify(g.setting = setting));
export const getSetting = () => {
    const result = localStorage.getItem('_setting');
    if (result) {
        const setting = JSON.parse(result) as ISetting;
        if (setting.format == settingFormat) return setting;
    }
    return defaultSetting();
};

const setStats = (stats: IStats) => {
    localStorage.setItem('_stats', JSON.stringify(g.stats = stats));
    if (worker.onStatsChanged) worker.onStatsChanged(stats);
}

export const getStats = () => {
    const result = localStorage.getItem('_stats');
    if (result) {
        const stats = JSON.parse(result) as IStats;
        if (stats.format == statsFormat) return stats;
    }
    return initStats();
};

const setSyncTime = (time: number) => localStorage.setItem('_sync-time', time.toString());
const getSyncTime = () => {
    const result = localStorage.getItem('_sync-time');
    if (!result) return 0;
    return parseInt(result);
}

export const signup = (email: string) => fetch(`/signup?email=${encodeURIComponent(email)}`);
export const login = (email: string, password: string) => fetch('/login', requestInit({ email, password }));
export const submitIssue = (issue: string) => fetch(`/issue`, requestInit(issue));

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
};

export const getDict = async (word: string, reload?: true) => {
    if (!word) return undefined;
    let dict: IDiction | undefined = undefined;
    if (reload) {
        dict = await fetchDiction(word);
        if (dict) {
            putDiction(dict);
            return dict;
        } else {
            dict = await getDiction(word);
            return dict;
        }
    } else {
        dict = await getDiction(word);
        if (dict) {
            if (dict.version + dictExpire < now())
                fetchDiction(word).then(d => d ? putDiction(d) : undefined);
            return dict;
        } else {
            dict = await fetchDiction(word);
            if (dict) {
                putDiction(dict);
                return dict;
            }
        }
    }
};

export const cacheDict = async function*() {
    const tasks = await getTasks(0);
    let i = 0;
    const n = tasks.length;
    for (const task of tasks) if (task?.word){
        const word = task.word;
        if (!await getDiction(word)) {
            const dict = await fetchDiction(word);
            if (dict) await putDiction(dict);
            else console.error(`Can not fetch word: ${word}.`)
        }
        yield (++i) / n;
    }
}

const openUserDB = (user: string) => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(user, 1);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
        const db = request.result;
        const taskStore = db.createObjectStore('task', { keyPath: ['type', 'word'] });
        taskStore.createIndex('last', 'last');
        taskStore.createIndex('next', 'next');
    };
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

export const deleteTask = async (task: ITask) => {
    letDelete(task);
    await putTask(task);
};

export const search = async (word: string) => {
    let task = await getTask('R', word);
    if (!task) putTask(task = { type: 'R', word, last: now(), next: 0, level: 0 });
    return task;
};

export const getEpisode = (types?: string, tag?: Tag, blevel?: BLevel) => new Promise<Array<ITask>>((resolve, reject) => {
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

const getTasks = (last: number) => new Promise<Array<ITask|undefined>>((resolve, reject) => {
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

export const syncTasks = async (lastTime?: number) => {
    const thisTime = now();
    if (!lastTime) lastTime = getSyncTime();
    const resp = await fetch(`/task?lastgt=${lastTime}`, requestInit(await getTasks(lastTime)));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await putTasks(ntasks);
    setSyncTime(thisTime);
};

const clarify = async () => {
    await new Promise<void>((resolve, reject) => {
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
    await new Promise<void>((resolve, reject) => {
        const request = g.dictDB!.transaction('dict', 'readwrite').objectStore('dict').openCursor();
        request.onerror = reject;
        request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) return resolve();
            const dict = cursor.value as IDiction;
            if (!g.vocabulary[dict.word]) cursor.delete();
            cursor.continue();
        }
    })
}

export const addTasks = (types: string, tag: Tag) => new Promise<void>((resolve, reject) => {
    const time = now();
    const transaction = g.userDB!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => {
        setStats(g.stats);
        syncTasks();
        resolve();
    }
    const objectStore = transaction.objectStore('task');
    for (const type of types) for (const word in g.vocabulary) {
        if (g.vocabulary[word]?.includes(tag)) objectStore.get([type, word]).onsuccess = (e) => {
            if (!(e.target as IDBRequest).result) {
                const task = newTask(type as TaskType, word);
                const tags = g.vocabulary[task.word];
                adjTaskToStats(task, g.stats, tags, -1);
                letNever(task, time);
                adjTaskToStats(task, g.stats, tags, 1);
                objectStore.add(task);
            }
        }
    }
});

export const updateStats = () => new Promise<void>((resolve, reject) => {
    const nstats: IStats = { ...g.stats, time: now() };
    const request = g.userDB!.transaction('task', 'readonly').objectStore('task')
        .index('last').openCursor(IDBKeyRange.bound(g.stats.time, nstats.time));
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return resolve(setStats(nstats));
        const task = cursor.value as ITask;
        const tags = g.vocabulary[task.word];
        adjTaskToStats(task, g.stats, tags, -1);
        adjTaskToStats(task, nstats, tags, 1);
        cursor.continue();
    }
});

const totalStats = () => new Promise<void>((resolve, reject) => {
    const stats = initStats(now());
    const transaction = g.userDB!.transaction('task', 'readonly');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(setStats(stats));
    const objectStore = transaction.objectStore('task');
    for (const type of TASK_TYPES) for (const word in g.vocabulary)
        objectStore.get([type, word]).onsuccess = (e) => {
            const task = (e.target as IDBRequest).result as ITask ?? newTask(type, word);
            adjTaskToStats(task, stats, g.vocabulary[word], 1);
        }
});

export const study = (otask: ITask) => new Promise<void>((resolve, reject) => {
    let level = otask.level;
    const transaction = g.userDB!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    objectStore.get([otask.type, otask.word]).onsuccess = (e) => {
        const task = (e.target as IDBRequest).result as ITask;
        if (!task) return reject('Not Found!');
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
});

const init = async (user: string ) => {
    g.dictDB = await openDictDB();
    g.userDB = await openUserDB(g.user = user);
    g.setting = getSetting();
    g.stats = getStats();

    const res1 = await fetch(vocabularyUrl, { cache: 'force-cache' });
    if (res1.ok) {
        const delimiter = /[,:] */;
        for (let line of (await res1.text()).split('\n')) if (line = line.trim()) {
            const [word, ...tags] = line.split(delimiter).map(w=>w.trim());
            g.vocabulary[word] = tags as Array<Tag>;
            worker.vocabulary.push(word);
        }
    }
    
    const _vocabulary_url = getVocabularyUrl();
    if (vocabularyUrl !== _vocabulary_url) {
        await clarify();
        setVocabularyUrl(vocabularyUrl);
    }
    
    syncSetting();
    await syncTasks();
    totalStats();
};

const close = () => {
    g.userDB?.close();
    g.dictDB?.close();
};

const logout = async (cleanUser: boolean, cleanDict: boolean) => {
    localStorage.clear();
    close();
    if (cleanDict) await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase('dict');
        request.onerror = reject;
        request.onsuccess = resolve;
    });
    if (cleanUser) await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(g.user);
        request.onerror = reject;
        request.onsuccess = resolve;
    });
};

export const worker = {
    vocabulary: [] as Array<string>,
    onSettingChanged: null as (((setting: ISetting) => void) | null),
    onStatsChanged: null as (((stats: IStats) => void) | null),
    init, close, logout
};