// deno-lint-ignore-file no-explicit-any no-empty
import { type HTTPMethod } from 'generic-ts/http-method.ts';
import { Payload, decode as jwtDecode } from 'djwt';
import { IDict } from 'dict/lib/idict.ts';
import { ITask, type TaskType, TaskTypes } from "./itask.ts";
import { type Tag, Tags } from "vocabulary/tag.ts";
import { type BLevel, type Stats, BLevels } from "./istat.ts";
import { jsonHeader } from "./mem-server.ts";
import Cookies from "js-cookie";

const vocabularyUrl = 'https://www.sholvoir.com/vocabulary/0.0.1/vocabulary.json';
const dictApi = 'https://dict.sholvoir.com/api';
const taskApi = '/api';

type Setting = {
    sprintNumber: number;
    wordBooks: Record<string, boolean>
}

const MAX_NEXT = 2000000000;
// times: 1m, 5m, 30m, 90m, 6h, 24h, 42h, 72h, 7d, 13d, 25d, 49d, 97d, 191d, 367d
const times = [60, 5*60, 30*60, 90*60, 6*60*60, 24*60*60, 42*60*60, 72*60*60, 7*24*60*60,
    13*24*60*60, 25*24*60*60, 49*24*60*60, 97*24*60*60, 191*24*60*60, 367*24*60*60];

const fetchInit = (body: any, method: HTTPMethod = 'POST' ) => ({
    method,
    headers: jsonHeader,
    body: JSON.stringify(body)
}) as RequestInit;

/**
 * map level to blevel
 * @param {number} level 0 ~ 16
 * @returns {number} blevel:
 *    finished: >= 16
 *    skilled: 14, 15
 *    familiar: 11, 12, 13
 *    medium: 7, 8, 9, 10
 *    start: 1,2,3,4,5,6
 *    never: 0
 */
const toBLevel = (level: number): BLevel => {
    if (level > 15) return 'finished';
    if (level > 13) return 'skilled';
    if (level > 10) return 'familiar';
    if (level > 6) return 'medium';
    if (level > 0) return 'start';
    return 'never';
};

export const study = (task: ITask) => {
    task.last = Math.round(Date.now() / 1000);
    const next = times[task.level++];
    task.next = next ? task.last + next : MAX_NEXT;
}

export type StudyType = (taskType?: TaskType, tag?: Tag, blevel?: BLevel) => void;

// Local Storage
let _db: IDBDatabase | undefined;
let vocabulary: Record<string, Array<Tag>>;
let setting: Setting;

export const getAuth = () => Cookies.get('auth');
export const removeAuth = () => Cookies.remove('auth');

export const getSyncTime = () => +(localStorage.getItem('_sync-time') ?? 0);
export const setSyncTime = (time: number) => localStorage.setItem('_sync-time', `${time}`);

export const getSetting = () => {
    if (setting) return setting;
    const s = localStorage.getItem('_setting');
    if (s) return JSON.parse(s) as Setting;
    setting  = { sprintNumber: 10, wordBooks: {} };
    const tag: Tag = 'OG';
    for (const taskType of TaskTypes) setting.wordBooks[`${taskType}${tag}`] = true;
    return setting;
}
export const setSetting = () => setting && localStorage.setItem('_setting', JSON.stringify(setting));

export const getStats = () => {
    const s = localStorage.getItem('_stats');
    return s ? JSON.parse(s) as Stats : initStats();
}
const setStats = (stats: Stats) => localStorage.setItem('_stats', JSON.stringify(stats));


export const getUser = () => {
    const token = getAuth();
    if (token) try {
        const [_, payload] = jwtDecode(token) as [unknown, Payload, Uint8Array];
        return payload.aud as string;
    } catch {}
};

export const openDatabase = () => new Promise<boolean>((resolve, reject) => {
    const email = getUser();
    if (!email) return reject('Login first!');
    const userId = btoa(email).replaceAll('=', '');
    const request = indexedDB.open(userId, 1);
    let needInitData = false;
    request.onerror = () => {
        console.error(`Database Error: ${request.error}.`)
        reject(request.error);
    }
    request.onsuccess = () => {
        _db = request.result;
        resolve(needInitData);
    }
    request.onupgradeneeded = () => {
        const taskStore = request.result.createObjectStore('task', { keyPath: ['type', 'word'] });
        taskStore.createIndex('last', 'last');
        taskStore.createIndex('next', 'next');
        setSyncTime(0);
        needInitData = true;
    };
});

export const closeDatabase = () => _db?.close();

export const initVocabulary = async () => {
    const resp = await fetch(vocabularyUrl);
    if (!resp.ok) throw new Error('Network Error, Can not download init data!');
    vocabulary = await resp.json();
}

export const getTask = (type: TaskType, word: string) => new Promise<ITask>((resolve, reject) => {
    if (!_db) return reject('Open Database First!');
    const request = _db.transaction('task', 'readonly').objectStore('task').get([type, word]);
    request.onsuccess = () => resolve(request.result);
    request.onerror = reject;
});

const getTasks = (last: number) => new Promise<Array<ITask>>((resolve, reject) => {
    if (!_db) return reject('Open Database First!');
    const request = _db.transaction('task', 'readonly').objectStore('task').index('last').getAll(IDBKeyRange.lowerBound(last, true));
    request.onsuccess = () => resolve(request.result);
    request.onerror = reject;
})

export const putTasks = (tasks: Array<ITask>) => new Promise<void>((resolve, reject) => {
    if (!_db) return reject('Open Database First!');
    const transaction = _db.transaction('task', 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onerror = (e) => reject(e);
    const objectStore = transaction.objectStore('task');
    for (const task of tasks) {
        const req = objectStore.get([task.type, task.word]);
        req.onsuccess = () => {
            const otask = req.result as ITask;
            if (!otask || task.last > otask.last) objectStore.put(task);
        };
    }
})

export const initTasks = async () => {
    if (!vocabulary) throw new Error('Please Init Vocabulary First!');
    const tasks: Array<ITask> = []
    for (const word in vocabulary) for (const type of TaskTypes)
        tasks.push({type, word, last: 0, next: MAX_NEXT, level: 0});
    await putTasks(tasks);
}

const traversingTask = (
    each: (cursor: IDBCursorWithValue) => boolean,
    indexName?: string,
    query?: IDBValidKey | IDBKeyRange,
    direction?: IDBCursorDirection
) => new Promise<void>((resolve, reject) => {
    if (!_db) return reject('Open Database First!');
    const objectStore = _db.transaction('task', 'readonly').objectStore('task');
    const request = indexName ?
        objectStore.index(indexName).openCursor(query, direction) :
        objectStore.openCursor(query, direction);
    request.onerror = error => reject(error);
    request.onsuccess = () => {
        const cursor = request.result!;
        if (!cursor) return resolve();
        if (each(cursor)) cursor.continue();
        else resolve();
    }
});


export const signup = async (email: string) => {
    const resp = await fetch(`/signup?email=${encodeURIComponent(email)}`);
    if (!resp.ok) throw new Error(`Error: ${await resp.text()}`);
};

export const getDict = async (word: string) => {
    const resp = await fetch(`${dictApi}/${encodeURIComponent(word)}`);
    if (!resp.ok) throw new Error(`Error: ${await resp.text()}`);
    return await resp.json() as IDict;
}

export const initStats = () => {
    const stats: Stats = {} as any;
    for (const taskType of TaskTypes) {
        stats[taskType] = {} as any;
        for (const tag of Tags) {
            stats[taskType][tag] = { all: {} as any, task: {} as any };
            for (const blevel of BLevels) {
                stats[taskType][tag].all[blevel] = 0;
                stats[taskType][tag].task[blevel] = 0;
            }
        }
    }
    return stats;
}

export const updateStats = async () => {
    const stats = initStats();
    const ctime = Math.ceil(Date.now() / 1000);
    await traversingTask(
        (cursor) => {
            const task = cursor.value as ITask;
            const blevel = toBLevel(task.level);
            const tags = vocabulary[task.word];
            if (tags) for (const tag of tags) {
                const stat = stats[task.type][tag];
                stat.all[blevel]++;
                if (task.next < ctime) stat.task[blevel]++;
            }
            return true;
        }
    );
    setStats(stats);
    return stats;
}

export const syncTasks = async () => {
    const syncTime = getSyncTime();
    const now = Math.ceil(Date.now() / 1000);
    const otasks = await getTasks(syncTime);
    const resp =  await fetch(`${taskApi}/task?lastgt=${syncTime}`, fetchInit(otasks));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await putTasks(ntasks);
    setSyncTime(now);
}

export const getEpisode = async (taskType?: TaskType, tag?: Tag, blevel?: BLevel) => {
    const tasks: Array<ITask> = [];
    const ctime = Math.ceil(Date.now() / 1000);
    const sprintNumber = getSetting().sprintNumber;
    const query = blevel == 'never' ? undefined : IDBKeyRange.upperBound(ctime);
    await traversingTask(
        cursor => {
            const task = cursor.value as ITask;
            if (taskType && task.type != taskType) return true;
            if (tag && !vocabulary[task.word].includes(tag)) return true;
            if (blevel && toBLevel(task.level) != blevel) return true;
            tasks.push(task);
            return tasks.length < sprintNumber;
        },
        'next', query, "prev"
    );
    return tasks;
};