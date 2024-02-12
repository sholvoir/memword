// deno-lint-ignore-file no-explicit-any
import { parse as yamlParse } from '$std/yaml/parse.ts';
import { type HTTPMethod } from 'generic-ts/http-method.ts';
import { Payload, decode as jwtDecode } from 'djwt';
import Cookies from "js-cookie";
import { BLevel, IStats, bLevelIncludes } from "./istat.ts";
import { Tag, Tags } from "vocabulary/tag.ts";
import { ITask, TaskType, TaskTypes } from "./itask.ts";
import { ISetting } from "./isetting.ts";
import { IDiction } from "./idict.ts";
import { IStudy } from "./istudy.ts";

const settingFormat = '0.0.2';
const statsFormat = '0.0.2';
const vocabularyUrl = 'https://www.sholvoir.com/vocabulary/0.0.2/vocabulary.txt';
const revisionUrl = 'https://www.sholvoir.com/vocabulary/0.0.2/revision.yaml';
const dictApi = 'https://dict.sholvoir.com/api';
const MAX_NEXT = 2000000000;
const dictExpire = 7 * 24 * 60 * 60;
const now = () => Math.floor(Date.now() / 1000);
// times: 1m, 5m, 30m, 3h, 18h, 36h, 3d, 7d, 13d, 25d, 49d, 97d, 191d, 367d
const times = [60, 5 * 60, 30 * 60, 3 * 60 * 60, 18 * 60 * 60, 36 * 60 * 60, 3 * 24 * 60 * 60, 7 * 24 * 60 * 60,
    13 * 24 * 60 * 60, 25 * 24 * 60 * 60, 49 * 24 * 60 * 60, 97 * 24 * 60 * 60, 191 * 24 * 60 * 60, 367 * 24 * 60 * 60
];

const fetchInit = (body: any, method: HTTPMethod = 'POST') => ({
    method,
    headers: [['Content-Type', 'application/json']],
    body: JSON.stringify(body)
}) as RequestInit;

export const signup = async (email: string) => await fetch(`/signup?email=${encodeURIComponent(email)}`);
export const login = async (email: string, password: string) => await fetch('/login', fetchInit({ email, password }));
export const submitIssue = async (issue: string) => await fetch(`/issue`, { method: 'POST', body: issue });

let vocabulary: Record<string, Array<Tag>>;
let revision: Record<string, string>;
let dictDB: IDBDatabase;
let userDB: IDBDatabase;

export const getUser = () => {
    const token = Cookies.get('auth');
    if (token) return (jwtDecode(token)[1] as Payload).aud as string;
};

const setVocabularyUrl = (url: string) => localStorage.setItem('_vocabulary_url', url);
const getVocabularyUrl = () => localStorage.getItem('_vocabulary_url');

export const setSetting = async (setting: ISetting) => {
    if (!setting) return;
    localStorage.setItem('_setting', JSON.stringify(setting));
    return await fetch('/setting', fetchInit(setting, 'PUT'));
};

export const getSetting = () => {
    const result = localStorage.getItem('_setting');
    if (result) {
        const p = JSON.parse(result) as ISetting;
        if (p.format == settingFormat) return p;
    }
    return { format: settingFormat, sprintNumber: 10, wordBooks: ['LOG', 'ROG'], showStartPage: true } as ISetting;
};

export const updateSetting = async () => {
    const resp = await fetch('/setting');
    if (!resp.ok) return undefined;
    const setting = await resp.json() as ISetting;
    localStorage.setItem('_setting', JSON.stringify(setting));
    return setting;
};

const openDictDB = () => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('dict', 1);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => request.result.createObjectStore('dict', { keyPath: 'word' });
});

export const getDiction = async (word: string, refresh?: boolean): Promise<IDiction|undefined> => {
    let dict: IDiction|undefined = undefined;
    if (!refresh) {
        dict = await new Promise<IDiction>((resolve, reject) => {
            const request = dictDB.transaction('dict', 'readonly').objectStore('dict').get(word);
            request.onerror = reject;
            request.onsuccess = () => resolve(request.result);
        });
        if ((refresh === false) && dict) return dict;
    };
    if (refresh || !dict || dict.version + dictExpire < now()) {
        const resp = await fetch(`${dictApi}/${encodeURIComponent(word)}`, { cache: 'no-cache' });
        if (!resp.ok) return dict;
        dict = await resp.json() as IDiction;
        dict.word = word;
        dict.version = now();
        dictDB.transaction('dict', 'readwrite').objectStore('dict').put(dict);
    }
    return dict;
};

const openUserDB = (user: string) => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(user, 1);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
        const db = request.result;
        const kvStore = db.createObjectStore('kv', { keyPath: 'key' });
        kvStore.put({ key: '_sync-time', value: 0 });
        const taskStore = db.createObjectStore('task', { keyPath: ['type', 'word'] });
        taskStore.createIndex('last', 'last');
        taskStore.createIndex('next', 'next');
    };
});

export const close = () => { userDB?.close(); dictDB?.close() };

export const removeAuth = async (user?: string, cleanDict = false) => {
    close();
    if (cleanDict) await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase('dict');
        request.onerror = reject;
        request.onsuccess = resolve;
    });
    if (user) await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(user);
        request.onerror = reject;
        request.onsuccess = resolve;
    });
    Cookies.remove('auth');
    localStorage.clear();
};

const getSyncTime = async () => await new Promise<number>((resolve, reject) => {
    const request = userDB!.transaction('kv', 'readonly').objectStore('kv').get('_sync-time');
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result.value);
});

const setSyncTime = async (time: number) => await new Promise<void>((resolve, reject) => {
    const request = userDB!.transaction('kv', 'readwrite').objectStore('kv').put({ key: '_sync-time', value: time });
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

export const getTask = (type: TaskType, word: string) => new Promise<ITask>((resolve, reject) => {
    const request = userDB!.transaction('task', 'readonly').objectStore('task').get([type, word]);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

export const putTask = (task: ITask) => new Promise<void>((resolve, reject) => {
    const request = userDB!.transaction('task', 'readwrite').objectStore('task').put(task);
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

const deleteTask = (type: TaskType, word: string) => new Promise<void>((resolve, reject) => {
    const request = userDB!.transaction('task', 'readwrite').objectStore('task').delete([type, word]);
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

const getTasks = (last: number) => new Promise<Array<ITask>>((resolve, reject) => {
    const request = userDB!.transaction('task', 'readonly').objectStore('task').index('last').getAll(IDBKeyRange.lowerBound(last));
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

export const putTasks = (tasks: Array<ITask>) => new Promise<void>((resolve, reject) => {
    const transaction = userDB!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    for (const task of tasks) objectStore.get([task.type, task.word]).onsuccess = (e) => {
        const otask = (e.target as IDBRequest).result as ITask;
        if (!otask || task.last > otask.last) {
            objectStore.put(task);
        }
    };
});

export const addTasks = (types: TaskType[], tag: Tag) => new Promise<void>((resolve, reject) => {
    const time = now();
    const transaction = userDB!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    for (const type of types) for (const word in vocabulary!) {
        if (vocabulary![word]?.includes(tag)) objectStore.get([type, word]).onsuccess = (e) => {
            const task = (e.target as IDBRequest).result as ITask;
            if (!task) objectStore.add({type, word, last: time, next: 0, level: 0})
        }
    }
});

export const clearTasks = async () => {
    const needRemove = new Set<ITask>();
    await new Promise<void>((resolve, reject) => {
        const request = userDB!.transaction('task', 'readonly').objectStore('task').openCursor();
        request.onerror = reject;
        request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) return resolve();
            const task = cursor.value as ITask;
            if (task.last == 0 && task.level == 0 && task.next == MAX_NEXT) needRemove.add(task);
            if (!vocabulary![task.word]) needRemove.add(task);
            return true;
        }
    });
    for (const task of needRemove) await removeTask(task.type, task.word);
};

export const syncTasks = async () => {
    const thisTime = now();
    const lastTime = await getSyncTime();
    const otasks = await getTasks(lastTime);
    const resp = await fetch(`/task?lastgt=${lastTime}`, fetchInit(otasks));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await putTasks(ntasks);
    await setSyncTime(thisTime);
};

export const removeTask = async (type: TaskType, word: string) => {
    await deleteTask(type, word);
    await fetch(`/task?type=${encodeURIComponent(type)}&word=${encodeURIComponent(word)}`, { method: 'DELETE' });
};

export const study = ({ type, word, level }: ITask, stats: IStats) => new Promise<void>((resolve, reject) => {
    const transaction = userDB!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    objectStore.get([type, word]).onsuccess = (e) => {
        const task = (e.target as IDBRequest).result as ITask;
        if (task) {
            removeTaskFromStats(stats, task);
            task.level = level;
            task.last = now();
            const next = times[task.level++];
            task.next = next ? task.last + next : MAX_NEXT;
            objectStore.put(task);
            addTaskToStats(stats, task);
        }
    }
});

const initStats = () => {
    const stats = { format: statsFormat, time: 0, all: {}, task: {} } as IStats;
    for (const taskType of TaskTypes) {
        stats.all[taskType] = {} as any;
        stats.task[taskType] = {} as any;
        for (const tag of Tags) {
            stats.all[taskType][tag] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            stats.task[taskType][tag] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        }
    }
    return stats;
};

const addTaskToStats = (stats: IStats, task: ITask) => {
    const tags = vocabulary![task.word];
    if (tags) for (const tag of tags) {
        stats.all[task.type][tag][task.level]++;
        if (task.next < stats.time) stats.task[task.type][tag][task.level]++;
    }
};
const removeTaskFromStats = (stats: IStats, task: ITask) => {
    const tags = vocabulary![task.word];
    if (tags) for (const tag of tags) {
        stats.all[task.type][tag][task.level]--;
        if (task.next < stats.time) stats.task[task.type][tag][task.level]--;
    }
};

export const getStats = () => {
    const result = localStorage.getItem('_stats');
    if (result) {
        const stats = JSON.parse(result) as IStats;
        if (stats.format == statsFormat) return stats;
    }
    return initStats();
};

export const updateStats = (stats: IStats) => new Promise<IStats>((resolve, reject) => {
    const nstats: IStats = { format: stats.format, time: now(), all: stats.all, task: stats.task };
    const request = userDB!.transaction('task', 'readonly').objectStore('task')
        .index('next').openCursor(IDBKeyRange.bound(stats.time, nstats.time, false, true));
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
            localStorage.setItem('_stats', JSON.stringify(nstats));
            return resolve(nstats);
        }
        const task = cursor.value as ITask;
        removeTaskFromStats(stats, task);
        addTaskToStats(nstats, task);
        cursor.continue();
    }
});

export const totalStats = () => new Promise<IStats>((resolve, reject) => {
    const stats = initStats();
    stats.time = now();
    const transaction = userDB!.transaction('task', 'readonly');
    transaction.onerror = reject;
    transaction.oncomplete = () => {
        localStorage.setItem('_stats', JSON.stringify(stats));
        resolve(stats);
    }
    const objectStore = transaction.objectStore('task');
    for (const type of TaskTypes) for (const word in vocabulary!)
        objectStore.get([type, word]).onsuccess = (e) => {
            const task = (e.target as IDBRequest).result as ITask;
            addTaskToStats(stats, task ?? { type, word, last: 0, next: MAX_NEXT, level: 0 });
        }
});

export const getEpisode = async (sprintNumber: number, taskType?: TaskType, tag?: Tag, blevel?: BLevel) => {
    const tasks: Array<ITask> = [];
    await new Promise<void>((resolve, reject) => {
        const request = userDB!.transaction('task', 'readonly').objectStore('task')
            .index('next').openCursor(blevel == 'never' ? undefined : IDBKeyRange.upperBound(now()), "prev");
        request.onerror = reject;
        request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) return resolve();
            const task = cursor.value as ITask;
            if ((!taskType || task.type == taskType) && (!tag || vocabulary![task.word]?.includes(tag)) && (!blevel || bLevelIncludes(blevel, task.level)))
            tasks.push(task);
            if (tasks.length < sprintNumber) cursor.continue();
            else resolve(); 
        }
    });
    const studies: Array<IStudy> = [];
    for (const task of tasks) {
        const dict = await getDiction(task.word);
        studies.push({ ...task, ...dict } as IStudy);
    }
    return studies;
};

export const searchWord = async (word: string) => {
    if (!vocabulary?.[word] && !(word = revision[word])) return undefined;
    let task = await getTask('R', word);
    if (!task) {
        task = { type: 'R', word, last: 0, next: MAX_NEXT, level: 0 };
        await putTask(task);
    }
    const dict = await getDiction(task.word);
    return { ...task, ...dict } as IStudy;
};

export const init = async (user: string) => {
    dictDB = await openDictDB();
    const res1 = await fetch(vocabularyUrl, { cache: 'force-cache' });
    if (res1.ok) {
        vocabulary = {};
        for (const line of (await res1.text()).split('\n')) {
            const [word, ...tags] = line.split(/[,:] */).map(w=>w.trim());
            vocabulary[word] = tags as Array<Tag>;
        }
    }
    const res2 = await fetch(revisionUrl, { cache: 'force-cache' });
    if (res2.ok) revision = yamlParse(await res2.text()) as Record<string, string>;
    userDB = await openUserDB(user);
    if (vocabularyUrl !== getVocabularyUrl()) {
        clearTasks();
        setVocabularyUrl(vocabularyUrl);
    }
};
