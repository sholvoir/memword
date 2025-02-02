// deno-lint-ignore-file no-explicit-any
import { IStat, addTaskToStat, isBLevelIncludesLevel, initStat } from "./istat.ts";
import { IDict } from "./idict.ts";
import { ITask } from "./itask.ts";
import { IItem, itemMergeDict, itemMergeTask, MAX_NEXT, neverItem, } from "./iitem.ts";
import { now } from "./common.ts";
import { IWordList } from "./wordlist.ts";

type kvKey = '_vocabulary-version'|'_sync-time'|'_setting';
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
        d.createObjectStore('wordlist', { keyPath: ['user', 'name']})
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

export const getWordlistVersion = (user: string, name: string) => new Promise<string|undefined>((resolve, reject) => run(reject, db => {
    const request = db.transaction('wordlist', 'readonly').objectStore('wordlist').get([user, name]);
    request.onerror = reject;
    request.onsuccess = (e) => {
        const wordlist = (e.target as IDBRequest<IWordList>).result;
        resolve(wordlist && wordlist.version);
    }
}));

export const setWordlistVersion = (wordlist: IWordList) => new Promise<void>((resolve, reject) => run(reject, db => {
    const request = db.transaction('wordlist', 'readwrite').objectStore('wordlist').put(wordlist);
    request.onerror = reject;
    request.onsuccess = () => resolve();
}))

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

export const addTasks = (words: Iterable<string>) => new Promise<void>((resolve, reject) => run(reject, db => {
    const time = now();
    const transaction = db.transaction('item', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const iStore = transaction.objectStore('item');
    for (const word of words) iStore.get(word).onsuccess = (e) => {
        const item = (e.target as IDBRequest<IItem>).result;
        if (!item) iStore.add(neverItem(word, time));
    }
}));

export const mergeTasks = (tasks: Array<ITask>) => new Promise<void>((resolve, reject) => run(reject, db => {
    const transaction = db.transaction('item', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const iStore = transaction.objectStore('item');
    for (const task of tasks) iStore.get(task.word).onsuccess = (e) => {
        const item = (e.target as IDBRequest<IItem>).result;
        if (!item) iStore.add(task);
        else if (task.last > item.last) iStore.put(itemMergeTask(item, task));
    };
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

export const getEpisode = (wordList?: Set<string>, blevel?: number) => new Promise<IItem|undefined>((resolve, reject) => run(reject, db => {
    let result: IItem;
    const transaction = db.transaction('item', 'readonly');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(result);
    transaction.objectStore('item').index('next').openCursor(IDBKeyRange.upperBound(now()), "prev").onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return;
        const item = cursor.value as IItem;
        if ((!wordList || wordList.has(item.word)) && (!blevel || isBLevelIncludesLevel(blevel, item.level)))
            return result = item;
        cursor.continue();
    }
}));

export const getStats = (words?: Iterable<string>) => new Promise<IStat>((resolve, reject) => run(reject, db => {
    const stat: IStat = initStat();
    const transaction = db.transaction('item', 'readonly');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve(stat);
    const iStore = transaction.objectStore('item');
    if (words) for (const word of words) iStore.get(word).onsuccess = (e) =>
        addTaskToStat(stat, (e.target as IDBRequest<IItem>).result);
    else iStore.openCursor().onsuccess = e => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return;
        addTaskToStat(stat, cursor.value);
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