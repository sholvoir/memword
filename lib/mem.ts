// deno-lint-ignore-file no-explicit-any
import { type HTTPMethod } from 'generic-ts/http-method.ts';
import { jsonHeader } from "./mem-server.ts";
import { Payload, decode as jwtDecode } from 'djwt';
import Cookies from "js-cookie";
import { BLevel, BLevels, Stats } from "./istat.ts";
import { Tag, Tags } from "vocabulary/tag.ts";
import { ITask, TaskType, TaskTypes } from "./itask.ts";
import { ISetting } from "./isetting.ts";
import { IDict } from "dict/lib/idict.ts";

const MAX_NEXT = 2000000000;
const now = () => Math.floor(Date.now() / 1000);
// times: 1m, 5m, 30m, 90m, 6h, 24h, 42h, 72h, 7d, 13d, 25d, 49d, 97d, 191d, 367d
const times = [60, 5 * 60, 30 * 60, 90 * 60, 6 * 60 * 60, 24 * 60 * 60, 42 * 60 * 60, 72 * 60 * 60, 7 * 24 * 60 * 60,
    13 * 24 * 60 * 60, 25 * 24 * 60 * 60, 49 * 24 * 60 * 60, 97 * 24 * 60 * 60, 191 * 24 * 60 * 60, 367 * 24 * 60 * 60
];

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

const fetchInit = (body: any, method: HTTPMethod = 'POST') => ({
    method,
    headers: jsonHeader,
    body: JSON.stringify(body)
}) as RequestInit;

export const signup = async (email: string) => await fetch(`/signup?email=${encodeURIComponent(email)}`);
export const login = async (email: string, password: string) => await fetch('/login', fetchInit({ email, password }));
export const submitIssue = async (issue: string) => await fetch(`/issue`, { method: 'POST', body: issue });
export const getDict = async (word: string, refresh?: boolean) => {
    const resp = await fetch(`/dict/${encodeURIComponent(word)}`, refresh? { cache: 'no-cache' } : undefined);
    if (resp.ok) return resp.json() as IDict;
}
export const removeAuth = () => Cookies.remove('auth');

export const user = (() => {
    const token = Cookies.get('auth');
    if (token) {
        const [_, payload] = jwtDecode(token) as [unknown, Payload, Uint8Array];
        return payload.aud as string;
    }
})();

export const getSetting = () => {
    const result = localStorage.getItem('_setting');
    if (result) return JSON.parse(result) as ISetting;
    const defaultSetting: ISetting = { sprintNumber: 10, wordBooks: {} };
    for (const taskType of TaskTypes) defaultSetting.wordBooks[`${taskType}OG`] = true;
    return defaultSetting;
};
export const setSetting = (s: ISetting) => localStorage.setItem('_setting', JSON.stringify(setting = s));
export let setting = getSetting();

let vocabulary: Record<string, Array<Tag>>;
let userDB: IDBDatabase;

const getSyncTime = () => +(localStorage.getItem('_sync-time') ?? 0);
const setSyncTime = (time: number) => localStorage.setItem('_sync-time', `${time}`);


const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(user!, 1);
    request.onerror = () => {
        console.error(`Database Error: ${request.error}.`);
        reject(request.error);
    }
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
        const db = request.result;
        const taskStore = db.createObjectStore('task', { keyPath: ['type', 'word'] });
        taskStore.createIndex('last', 'last');
        taskStore.createIndex('next', 'next');
        for (const word in vocabulary) for (const type of TaskTypes)
            taskStore.put({ type, word, last: 0, next: MAX_NEXT, level: 0 });
    };
});

export const close = () => userDB?.close();

export const getTask = (type: TaskType, word: string) => new Promise<ITask>((resolve, reject) => {
    const request = userDB!.transaction('task', 'readonly').objectStore('task').get([type, word]);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

const getTasks = (last: number) => new Promise<Array<ITask>>((resolve, reject) => {
    const request = userDB!.transaction('task', 'readonly').objectStore('task').index('last').getAll(IDBKeyRange.lowerBound(last, true));
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

export const putTasks = (tasks: Array<ITask>) => new Promise<void>((resolve, reject) => {
    const transaction = userDB!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    for (const task of tasks) {
        const req = objectStore.get([task.type, task.word]);
        req.onsuccess = () => {
            const otask = req.result as ITask;
            if (!otask || task.last > otask.last) {
                objectStore.put(task);
            }
        };
    }
});

export const syncTasks = async () => {
    const thisTime = now();
    const lastTime = getSyncTime();
    const otasks = await getTasks(lastTime);
    const resp = await fetch(`/task?lastgt=${lastTime}`, fetchInit(otasks));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await putTasks(ntasks);
    setSyncTime(thisTime);
}

const traversingTask = (
    each: (cursor: IDBCursorWithValue) => boolean,
    indexName?: string,
    query?: IDBValidKey | IDBKeyRange,
    direction?: IDBCursorDirection
) => new Promise<void>((resolve, reject) => {
    const objectStore = userDB!.transaction('task', 'readonly').objectStore('task');
    const request = indexName ?
        objectStore.index(indexName).openCursor(query, direction) :
        objectStore.openCursor(query, direction);
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result!;
        if (!cursor) return resolve();
        if (each(cursor)) cursor.continue();
        else resolve();
    }
});

export const study = ({ type, word, level }: ITask) => new Promise<void>((resolve, reject) => {
    const transaction = userDB!.transaction('task', 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onerror = (e) => reject(e);
    const objectStore = transaction.objectStore('task');
    const request = objectStore.get([type, word]);
    request.onerror = reject;
    request.onsuccess = () => {
        const task = request.result as ITask;
        task.level = level;
        task.last = now();
        const next = times[task.level++];
        task.next = next ? task.last + next : MAX_NEXT;
        objectStore.put(task);
    }
});

const initStats = () => {
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

export const getStats = () => {
    const result = localStorage.getItem('_stats');
    if (result) return JSON.parse(result) as Stats;
    return initStats();
}

export const updateStats = async () => {
    const stats = initStats();
    const ctime = now();
    await traversingTask(
        (cursor) => {
            const task = cursor.value as ITask;
            const blevel = toBLevel(task.level);
            const tags = vocabulary![task.word];
            if (tags) for (const tag of tags) {
                const stat = stats[task.type][tag];
                stat.all[blevel]++;
                if (task.next < ctime) stat.task[blevel]++;
            }
            return true;
        }
    );
    localStorage.setItem('_stats', JSON.stringify(stats));
    return stats;
};

export const getEpisode = async (taskType?: TaskType, tag?: Tag, blevel?: BLevel) => {
    const tasks: Array<ITask> = [];
    const ctime = now();
    const sprintNumber = setting!.sprintNumber;
    const query = blevel == 'never' ? undefined : IDBKeyRange.upperBound(ctime);
    await traversingTask(
        cursor => {
            const task = cursor.value as ITask;
            if (taskType && task.type != taskType) return true;
            if (tag && !vocabulary![task.word].includes(tag)) return true;
            if (blevel && toBLevel(task.level) != blevel) return true;
            tasks.push(task);
            return tasks.length < sprintNumber;
        },
        'next', query, "prev"
    );
    return tasks;
};

export const init = async () => {
    const resp = await fetch('/vocabulary');
    if (resp.ok) vocabulary = await resp.json();
    if (user) userDB = await openDatabase();
}
