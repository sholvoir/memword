// deno-lint-ignore-file no-explicit-any no-cond-assign

import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, IStats, adjTaskToStats, bLevelIncludes, initStats } from "./istat.ts";
import { ITask, letDelete, letNew, MAX_NEXT, neverTask, shouldDelete } from "./itask.ts";
import { IDiction } from "./idict.ts";
import { now } from "./common.ts";

type kvKey = '_vocabulary-url'|'_sync-time'|'_setting'|'_stats';
interface IKV { key: kvKey, value: any }
interface IVocabulary { word: string; tags: Array<Tag> }
let db: IDBDatabase;

const run = (reject: (reason?: any) => void, func: (db: IDBDatabase) => void) => {
    if (db) return func(db);
    const request = indexedDB.open('memword', 1);
    request.onerror = reject;
    request.onsuccess = () => func(db = request.result);
    request.onupgradeneeded = () => {
        const d = request.result;
        d.createObjectStore('kv', { keyPath: 'key' });
        d.createObjectStore('dict', { keyPath: 'word' });
        d.createObjectStore('issue', { keyPath: 'id', autoIncrement: true });
        d.createObjectStore('vocabulary', { keyPath: 'word'});
        const taskStore = d.createObjectStore('task', { keyPath: 'word' });
        taskStore.createIndex('last', 'last');
        taskStore.createIndex('next', 'next');
    }
};

export const clearDict = () => new Promise((resolve, reject) => run(reject, db => {
    const request = db.transaction('dict', 'readwrite').objectStore('dict').clear();
    request.onerror = reject;
    request.onsuccess = resolve;
}));

export const clearTask = () => new Promise((resolve, reject) => run(reject, db => {
    const request = db.transaction('task', 'readwrite').objectStore('task').clear();
    request.onerror = reject;
    request.onsuccess = resolve;
}));

export const clearKv = () => new Promise((resolve, reject) => run(reject, db => {
    const request = db.transaction('kv', 'readwrite').objectStore('kv').clear();
    request.onerror = reject;
    request.onsuccess = resolve;
}));

export const getKv = (key: kvKey) => new Promise<any>((resolve, reject) => run(reject, db => {
    const request = db.transaction('kv', 'readonly').objectStore('kv').get(key);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result && request.result.value);
}));

export const setKv = (key: kvKey, value: any) => new Promise<void>((resolve, reject) => run(reject, db => {
    const request = db.transaction('kv', 'readwrite').objectStore('kv').put({ key, value });
    request.onerror = reject;
    request.onsuccess = () => resolve();
}));

export const getVocabulary = () => new Promise<Array<string>>((resolve, reject) => run(reject, db => {
    const vocabulary: Array<string> = [];
    const request = db.transaction('vocabulary', 'readonly').objectStore('vocabulary').openCursor();
    request.onerror = reject;
    request.onsuccess = e => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return resolve(vocabulary);
        vocabulary.push((cursor.value as IVocabulary).word);
        cursor.continue();
    }
}));

export const updateVocabulary = (lines: Array<string>) => new Promise<void>((resolve, reject) => run(reject, db => {
    const delimiter = /[,:] */;
    const transaction = db.transaction('vocabulary', 'readwrite');
    const vStore = transaction.objectStore('vocabulary');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    vStore.clear().onsuccess = () => {
        for (let line of lines) if (line = line.trim()) {
            const [word, ...tags] = line.split(delimiter).map(w => w.trim());
            vStore.add({word, tags})
        }
    }
}));

export const getIssues = () => new Promise<Array<{id: number, issue: string}>>((resolve, reject) => run(reject, db => {
    const request = db.transaction('issue', 'readonly').objectStore('issue').getAll();
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
}));

export const addIssue = (issue: string) => new Promise<void>((resolve, reject) => run(reject, db => {
    const request = db.transaction('issue', 'readwrite').objectStore('issue').add({issue});
    request.onerror = reject;
    request.onsuccess = () => resolve();
}));

export const deleteIssue = (id: number) => new Promise<void>((resolve, reject) => run(reject, db => {
    const request = db.transaction('issue', 'readwrite').objectStore('issue').delete(id);
    request.onerror = reject;
    request.onsuccess = () => resolve();
}));

export const getDiction = (word: string) => new Promise<IDiction | undefined>((resolve, reject) => run(reject, db => {
    const request = db.transaction('dict', 'readonly').objectStore('dict').get(word);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
}));

export const putDiction = (diction: IDiction) => new Promise<void>((resolve, reject) => run(reject, db => {
    const request = db.transaction('dict', 'readwrite').objectStore('dict').put(diction);
    request.onerror = reject;
    request.onsuccess = () => resolve();
}));

export const clarifyDiction = () => new Promise<void>((resolve, reject) => run(reject, db => {
    const transaction = db.transaction(['dict', 'vocabulary'], 'readwrite');
    const vstore = transaction.objectStore('vocabulary');
    transaction.onerror = reject;
    transaction.objectStore('dict').openCursor().onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return resolve();
        const dict = cursor.value as IDiction;
        vstore.get(dict.word).onsuccess = (e) => {
            if (!(e.target as IDBRequest).result) cursor.delete();
            cursor.continue();
        }
    }
}));

export const getTask = (word: string) => new Promise<ITask>((resolve, reject) => run(reject, db => {
    const request = db.transaction('task', 'readonly').objectStore('task').get(word);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
}));

export const putTask = (task: ITask) => new Promise<void>((resolve, reject) => run(reject, db => {
    const request = db.transaction('task', 'readwrite').objectStore('task').put(task);
    request.onerror = reject;
    request.onsuccess = () => resolve();
}));

export const getTasks = (last: number) => new Promise<Array<ITask>>((resolve, reject) => run(reject, db => {
    const request = db.transaction('task', 'readonly').objectStore('task').index('last').getAll(IDBKeyRange.lowerBound(last));
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
}));

export const addTasks = (tag: Tag) => new Promise<IStats>((resolve, reject) => run(reject, db => {
    const time = now();
    let stats = initStats();
    const transaction = db.transaction(['kv', 'task', 'vocabulary'], 'readwrite');
    const kvStore = transaction.objectStore('kv')
    const tStore = transaction.objectStore('task');
    const vStore = transaction.objectStore('vocabulary');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(stats);
    kvStore.get('_stats').onsuccess = (e1) => {
        const kv = (e1.target as IDBRequest<IKV>).result;
        if (kv) stats = kv.value;
        vStore.openCursor().onsuccess = (e2) => {
            const cursor = (e2.target as IDBRequest<IDBCursorWithValue>).result;
            if (!cursor) return kvStore.put({ key: '_stats', value: stats })
            const vocab = cursor.value as IVocabulary;
            if (!vocab.tags.includes(tag)) cursor.continue();
            else {
                tStore.get(vocab.word).onsuccess = (e3) => {
                    const task = (e3.target as IDBRequest).result;
                    if (!task) {
                        const task = neverTask(vocab.word);
                        adjTaskToStats(task, stats, vocab.tags, -1);
                        letNew(task, time);
                        adjTaskToStats(task, stats, vocab.tags, 1);
                        tStore.add(task);
                    }
                    cursor.continue();
                }
            }
        }
    }
}));

export const mergeTasks = (tasks: Array<ITask>) => new Promise<void>((resolve, reject) => run(reject, db => {
    const transaction = db.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    for (const ntask of tasks) {
        delete ntask._id;
        if (shouldDelete(ntask)) objectStore.delete(ntask.word);
        else objectStore.get(ntask.word).onsuccess = (e) => {
            const otask = (e.target as IDBRequest).result as ITask;
            if (!otask || ntask.last > otask.last) objectStore.put(ntask);
        };
    }
}));

export const clarifyTask = () => new Promise<void>((resolve, reject) => run(reject, db => {
    const transaction = db.transaction(['task', 'vocabulary'], 'readwrite');
    const vstore = transaction.objectStore('vocabulary');
    transaction.onerror = reject;
    transaction.objectStore('task').openCursor().onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return resolve();
        const task = cursor.value as ITask;
        vstore.get(task.word).onsuccess = (e) => {
            let modified = false;
            if (task.level > 15) modified = ((task.level = 15), true);
            if (!(e.target as IDBRequest).result) modified = (letDelete(task), true);
            if (modified) cursor.update(task);
            cursor.continue();
        }
    }
}));

export const getEpisode = (sprint: number, tag?: Tag, blevel?: BLevel) => new Promise<Array<ITask>>((resolve, reject) => run(reject, db => {
    const tasks: Array<ITask> = [];
    const transaction = db.transaction(['task', 'vocabulary'], 'readonly');
    const vstore = transaction.objectStore('vocabulary');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(tasks);
    transaction.objectStore('task').index('next').openCursor(IDBKeyRange.upperBound(now()), "prev").onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return;
        const task = cursor.value as ITask;
        vstore.get(task.word).onsuccess = e => {
            if ((!tag || (e.target as IDBRequest).result?.tags?.includes(tag)) && (!blevel || bLevelIncludes(blevel, task.level)))
                tasks.push(task);
            if (tasks.length < sprint) cursor.continue();
            else resolve(tasks);
        }
    }
}));

export const totalStats = () => new Promise<IStats>((resolve, reject) => run(reject, db => {
    const stats = initStats(now());
    const transaction = db.transaction(['kv', 'task', 'vocabulary'], 'readwrite');
    const kvStore = transaction.objectStore('kv');
    const tStore = transaction.objectStore('task');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(stats);
    transaction.objectStore('vocabulary').openCursor().onsuccess = e => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return kvStore.put({ key: '_stats', value: stats });
        const vocab = cursor.value as IVocabulary;
        tStore.get(vocab.word).onsuccess = (e1) => {
            const task = (e1.target as IDBRequest<ITask>).result ?? neverTask(vocab.word);
            adjTaskToStats(task, stats, vocab.tags, 1);
            cursor.continue();
        }
    }
}));

export const updateStats = () => new Promise<IStats>((resolve, reject) => run(reject, db => {
    let nstats = initStats();
    const transaction = db.transaction(['kv', 'task', 'vocabulary'], 'readwrite');
    const kvStore = transaction.objectStore('kv');
    const tStore = transaction.objectStore('task');
    const vStore = transaction.objectStore('vocabulary');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(nstats);
    kvStore.get('_stats').onsuccess = (e1) => {
        const kv = (e1.target as IDBRequest<IKV>).result;
        const oldStats = kv ? kv.value : initStats();
        nstats = { ...oldStats, time: now() }
        tStore.index('last').openCursor(IDBKeyRange.bound(oldStats.time, nstats.time)).onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (!cursor) return kvStore.put({ key: '_stats', value: nstats });
            const task = cursor.value as ITask;
            vStore.get(task.word).onsuccess = e1 => {
                const tags = (e1.target as IDBRequest<IVocabulary>).result.tags;
                adjTaskToStats(task, oldStats, tags, -1);
                adjTaskToStats(task, nstats, tags, 1);
                cursor.continue();
            }
        }
    }
}));

export const studyWord = (word: string, level: number) => new Promise<void>((resolve, reject) => run(reject, db => {
    const transaction = db.transaction(['kv', 'task', 'vocabulary'], 'readwrite');
    const kvStore = transaction.objectStore('kv');
    const tStore = transaction.objectStore('task');
    const vStore = transaction.objectStore('vocabulary');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    kvStore.get('_stats').onsuccess = (e1) => {
        const kv = (e1.target as IDBRequest<IKV>).result;
        const stats = kv ? kv.value : initStats();
        tStore.get(word).onsuccess = (e2) => {
            const task = (e2.target as IDBRequest<ITask>).result;
            if (!task) return;
            vStore.get(word).onsuccess = (e3) => {
                const vocab = (e3.target as IDBRequest<IVocabulary>).result;
                if (!vocab) return;
                adjTaskToStats(task, stats, vocab.tags, -1);
                task.level = level >= 15 ? 15 : ++level;
                task.last = now();
                task.next = level >= 15 ? MAX_NEXT : task.last + Math.round(39 * level ** 3 * 1.5 ** level);
                tStore.put(task).onsuccess = () => {
                    adjTaskToStats(task, stats, vocab.tags, 1);
                    kvStore.put({ key: '_stats', value: stats });
                }
            }
        }
    }
}));