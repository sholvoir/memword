// deno-lint-ignore-file no-explicit-any
import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, IStats, addTaskToStats, bLevelIncludes, initStats } from "./istat.ts";
import { IDict } from "@sholvoir/dict/lib/idict.ts";
import { ITask } from "./itask.ts";
import { IItem, itemMergeDict, itemMergeTask, MAX_NEXT, neverItem, } from "./iitem.ts";
import { now } from "./common.ts";

type kvKey = '_vocabulary-version'|'_sync-time';
let db: IDBDatabase;

const run = (reject: (reason?: any) => void, func: (db: IDBDatabase) => void) => {
    if (db) return func(db);
    const request = indexedDB.open('memword', 1);
    request.onerror = reject;
    request.onsuccess = () => func(db = request.result);
    request.onupgradeneeded = () => {
        const d = request.result;
        d.createObjectStore('mata', { keyPath: 'key' });
        d.createObjectStore('issue', { keyPath: 'id', autoIncrement: true });
        const iStore = d.createObjectStore('item', { keyPath: 'word' });
        iStore.createIndex('last', 'last');
        iStore.createIndex('next', 'next');
    }
};

export const clear = () => new Promise<void>((resolve, reject) => run(reject, db => {
    db.close();
    const request = indexedDB.deleteDatabase('memword');
    request.onerror = reject;
    request.onsuccess = () => resolve();
}))

export const getMeta = (key: kvKey) => new Promise<any>((resolve, reject) => run(reject, db => {
    const request = db.transaction('mata', 'readonly').objectStore('mata').get(key);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result && request.result.value);
}));

export const setMeta = (key: kvKey, value: any) => new Promise<void>((resolve, reject) => run(reject, db => {
    const request = db.transaction('mata', 'readwrite').objectStore('mata').put({ key, value });
    request.onerror = reject;
    request.onsuccess = () => resolve();
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

export const getVocabulary = () => new Promise<Array<string>>((resolve, reject) => run(reject, db => {
    const vocabulary: Array<string> = [];
    const request = db.transaction('item', 'readonly').objectStore('item').openCursor();
    request.onerror = reject;
    request.onsuccess = e => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return resolve(vocabulary);
        vocabulary.push((cursor.value as IItem).word);
        cursor.continue();
    }
}));

export const updateVocabulary = (vocabulary: Map<string, Array<Tag>>) => new Promise<Array<string>>((resolve, reject) => run(reject, db => {
    const needDelete: Array<string> = [];
    const transaction = db.transaction('item', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(needDelete);
    const iStore = transaction.objectStore('item');
    iStore.openCursor().onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) {
            for (const [word, tags] of vocabulary) iStore.add(neverItem(word, tags));
            return;
        }
        const item = cursor.value as IItem;
        if (vocabulary.has(item.word)) {
            const newTags = vocabulary.get(item.word)!;
            if (item.tags.join() != newTags.join()) {
                item.tags = newTags;
                cursor.update(item);
            }
            vocabulary.delete(item.word);
        }
        else {
            needDelete.push(item.word);
            cursor.delete();
        }
        cursor.continue();
    }
}));

export const getItem = (word: string) => new Promise<IItem>((resolve, reject) => run(reject, db => {
    const request = db.transaction('item', 'readonly').objectStore('item').get(word);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
}));

export const putItem = (item: IItem) => new Promise<void>((resolve, reject) => run(reject, db => {
    const request = db.transaction('item', 'readwrite').objectStore('item').put(item);
    request.onerror = reject;
    request.onsuccess = () => resolve();
}));

export const getItems = (last: number) => new Promise<Array<IItem>>((resolve, reject) => run(reject, db => {
    const request = db.transaction('item', 'readonly').objectStore('item').index('last').getAll(IDBKeyRange.lowerBound(last));
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
}));

export const addTasks = (tag: Tag) => new Promise<void>((resolve, reject) => run(reject, db => {
    const time = now();
    const transaction = db.transaction('item', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const iStore = transaction.objectStore('item');
    iStore.openCursor().onsuccess = (e2) => {
        const cursor = (e2.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return;
        const item = cursor.value as IItem;
        if (item.tags.includes(tag) && item.level == 0) {
            item.last = item.next = time;
            cursor.update(item);
        }
        cursor.continue();
    }
}));

export const mergeTasks = (tasks: Array<ITask>) => new Promise<void>((resolve, reject) => run(reject, db => {
    const transaction = db.transaction('item', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const iStore = transaction.objectStore('item');
    for (const task of tasks) {
        iStore.get(task.word).onsuccess = (e) => {
            const item = (e.target as IDBRequest<IItem>).result;
            if (!item) iStore.add(itemMergeTask(neverItem(task.word, []), task));
            else if (task.last > item.last) iStore.put(itemMergeTask(item, task));
        };
    }
}));

export const updateDict = (word: string, dict: IDict) => new Promise<IItem|undefined>((resolve, reject) => run(reject, db => {
    let item: IItem;
    const transaction = db.transaction('item', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(item);
    const iStore = transaction.objectStore('item');
    iStore.get(word).onsuccess = (e1) => {
        item = (e1.target as IDBRequest<IItem>).result;
        if (item) {
            itemMergeDict(item, dict);
            item.dversion = now();
            iStore.put(item);
        }
    }
}));

export const getEpisode = (tag?: Tag, blevel?: BLevel) => new Promise<IItem|undefined>((resolve, reject) => run(reject, db => {
    let result: IItem;
    const transaction = db.transaction('item', 'readonly');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(result);
    transaction.objectStore('item').index('next').openCursor(IDBKeyRange.upperBound(now()), "prev").onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return;
        const item = cursor.value as IItem;
        if ((!tag || item.tags.includes(tag)) && (!blevel || bLevelIncludes(blevel, item.level)))
            return result = item;
        cursor.continue();
    }
}));

export const getStats = () => new Promise<IStats>((resolve, reject) => run(reject, db => {
    const stats = initStats(now());
    const transaction = db.transaction('item', 'readonly');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(stats);
    transaction.objectStore('item').openCursor().onsuccess = e => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return;
        addTaskToStats(cursor.value, stats);
        cursor.continue();
    }
}));

export const studied = (word: string, level: number) => new Promise<void>((resolve, reject) => run(reject, db => {
    const transaction = db.transaction('item', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const iStore = transaction.objectStore('item');
    iStore.get(word).onsuccess = (e2) => {
        const item = (e2.target as IDBRequest<IItem>).result;
        if (!item) return;
        item.level = level >= 15 ? 15 : ++level;
        item.last = now();
        item.next = level >= 15 ? MAX_NEXT : item.last + Math.round(39 * level ** 3 * 1.5 ** level);
        iStore.put(item);
    }
}));