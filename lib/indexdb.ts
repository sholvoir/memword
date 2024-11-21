// deno-lint-ignore-file no-explicit-any

import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, IStats, adjTaskToStats, bLevelIncludes, initStats } from "./istat.ts";
import { ITask, letDelete, neverTask, newTask, shouldDelete } from "./itask.ts";
import { IDiction } from "./idict.ts";
import { now } from "./common.ts";

type kvKey = '_vocabulary-url'|'_sync-time'|'_setting';
const g = {} as { db: IDBDatabase };

export const vocabulary: Record<string, Array<Tag>> = {};

export const clearDict = () => new Promise((resolve, reject) => {
    const request = g.db.transaction('dict', 'readwrite').objectStore('dict').clear();
    request.onerror = reject;
    request.onsuccess = resolve;
});

export const clearTask = () => new Promise((resolve, reject) => {
    const request = g.db.transaction('task', 'readwrite').objectStore('task').clear();
    request.onerror = reject;
    request.onsuccess = resolve;
});

export const clearKv = () => new Promise((resolve, reject) => {
    const request = g.db.transaction('kv', 'readwrite').objectStore('kv').clear();
    request.onerror = reject;
    request.onsuccess = resolve;
});

export const getKv = (key: kvKey) => new Promise<any>((resolve, reject) => {
    const request = g.db.transaction('kv', 'readonly').objectStore('kv').get(key);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result && request.result.value);
});

export const setKv = (key: kvKey, value: any) => new Promise<void>((resolve, reject) => {
    const request = g.db.transaction('kv', 'readwrite').objectStore('kv').put({ key, value });
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

export const getIssues = () => new Promise<Array<{id: number, issue: string}>>((resolve, reject) => {
    const request = g.db.transaction('issue', 'readonly').objectStore('issue').getAll();
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

export const addIssue = (issue: string) => new Promise<void>((resolve, reject) => {
    const request = g.db.transaction('issue', 'readwrite').objectStore('issue').add({issue});
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

export const deleteIssue = (id: number) => new Promise<void>((resolve, reject) => {
    const request = g.db.transaction('issue', 'readwrite').objectStore('issue').delete(id);
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

export const getDiction = (word: string) => new Promise<IDiction | undefined>((resolve, reject) => {
    const request = g.db.transaction('dict', 'readonly').objectStore('dict').get(word);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

export const putDiction = (diction: IDiction) => new Promise<void>((resolve, reject) => {
    const request = g.db.transaction('dict', 'readwrite').objectStore('dict').put(diction);
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

export const clarifyDiction = () => new Promise<void>((resolve, reject) => {
    const request = g.db.transaction('dict', 'readwrite').objectStore('dict').openCursor();
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return resolve();
        const dict = cursor.value as IDiction;
        if (!vocabulary[dict.word]) cursor.delete();
        cursor.continue();
    }
});

export const getTask = (word: string) => new Promise<ITask>((resolve, reject) => {
    const request = g.db.transaction('task', 'readonly').objectStore('task').get(word);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

export const putTask = (task: ITask) => new Promise<void>((resolve, reject) => {
    const request = g.db.transaction('task', 'readwrite').objectStore('task').put(task);
    request.onerror = reject;
    request.onsuccess = () => resolve();
});


export const getTasks = (last: number) => new Promise<Array<ITask>>((resolve, reject) => {
    const request = g.db.transaction('task', 'readonly').objectStore('task').index('last').getAll(IDBKeyRange.lowerBound(last));
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

export const addTasks = (words: Array<string>) => new Promise<void>((resolve, reject) => {
    const transaction = g.db.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    const time = now();
    for (const word in words)
        objectStore.get(word).onsuccess = (e) =>
            (e.target as IDBRequest).result || objectStore.add(newTask(word, time));
});

export const mergeTasks = (tasks: Array<ITask>) => new Promise<void>((resolve, reject) => {
    const transaction = g.db.transaction('task', 'readwrite');
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
});

export const clarifyTask = () => new Promise<void>((resolve, reject) => {
    const request = g.db.transaction('task', 'readwrite').objectStore('task').openCursor();
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
        if (!vocabulary[task.word]) {
            letDelete(task);
            modified = true;
        }
        if (modified) cursor.update(task);
        cursor.continue();
    }
});

export const getEpisode = (sprint: number, tag?: Tag, blevel?: BLevel) => new Promise<Array<ITask>>((resolve, reject) => {
    const tasks: Array<ITask> = [];
    const request = g.db.transaction('task', 'readonly').objectStore('task')
        .index('next').openCursor(IDBKeyRange.upperBound(now()), "prev");
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return resolve(tasks);
        const task = cursor.value as ITask;
        if ((!tag || vocabulary[task.word]?.includes(tag))
            && (!blevel || bLevelIncludes(blevel, task.level)))
            tasks.push(task);
        if (tasks.length < sprint) cursor.continue();
        else resolve(tasks);
    }
});

export const totalStats = () => new Promise<IStats>((resolve, reject) => {
    const stats = initStats(now());
    const transaction = g.db.transaction('task', 'readonly');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(stats);
    const objectStore = transaction.objectStore('task');
    for (const word in vocabulary)
        objectStore.get(word).onsuccess = (e) => {
            const task = (e.target as IDBRequest).result as ITask ?? neverTask(word);
            adjTaskToStats(task, stats, vocabulary[word], 1);
        }
});

export const updateStats = (oldStats: IStats) => new Promise<IStats>((resolve, reject) => {
    const nstats: IStats = { ...oldStats, time: now() };
    const request = g.db.transaction('task', 'readonly').objectStore('task')
        .index('last').openCursor(IDBKeyRange.bound(oldStats.time, nstats.time));
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return resolve(nstats);
        const task = cursor.value as ITask;
        const tags = vocabulary[task.word];
        adjTaskToStats(task, oldStats, tags, -1);
        adjTaskToStats(task, nstats, tags, 1);
        cursor.continue();
    }
});

export const init = async () => {
    g.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('memword', 1);
        request.onerror = reject;
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
            const d = request.result;
            d.createObjectStore('kv', { keyPath: 'key' });
            d.createObjectStore('dict', { keyPath: 'word' });
            d.createObjectStore('issue', { keyPath: 'id', autoIncrement: true });
            const taskStore = d.createObjectStore('task', { keyPath: 'word' });
            taskStore.createIndex('last', 'last');
            taskStore.createIndex('next', 'next');
        }
    });
}