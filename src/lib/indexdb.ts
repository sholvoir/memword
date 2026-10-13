import type { IBook } from "./ibook.ts";
import type { ICard } from "./icard.ts";
import type { IDict } from "./idict.ts";
import type { IIssue } from "./iissue.ts";
import {
   type IItem,
   type ITask,
   itemMergeDict,
   neverItem,
   studyTask,
} from "./iitem.ts";
import { addTaskToStat, type IStat, initStat } from "./istat.ts";
import type { IIDTrace } from "./itrace.ts";
import { mergeTrace } from "./itrace.ts";

type kvKey =
   | "_auth"
   | "_lema"
   | "_page"
   | "_s-version"
   | "_setting"
   | "_st-time"
   | "_sync-time"
   | "_user"
   | "_vocabulary";

const metaTable = "meta";
const bookTable = "book";
const issueTable = "issue";
const itemTable = "item";
const cardTable = "card";

const db: IDBDatabase = await new Promise((resolve, reject) => {
   const request = indexedDB.open("memword", 4);
   request.onerror = reject;
   request.onsuccess = () => resolve(request.result);
   request.onupgradeneeded = (e) => {
      const d = request.result;
      if (e.oldVersion < 4)
         for (const store of d.objectStoreNames) d.deleteObjectStore(store);
      if (!d.objectStoreNames.contains(metaTable))
         d.createObjectStore(metaTable, { keyPath: "key" });
      if (!d.objectStoreNames.contains(bookTable))
         d.createObjectStore(bookTable, { keyPath: "bid" });
      if (!d.objectStoreNames.contains(issueTable))
         d.createObjectStore(issueTable, {
            keyPath: "iid",
            autoIncrement: true,
         });
      if (!d.objectStoreNames.contains(itemTable)) {
         const iStore = d.createObjectStore(itemTable, { keyPath: "word" });
         iStore.createIndex("last", "last");
         iStore.createIndex("next", "next");
      }
      if (!d.objectStoreNames.contains(cardTable)) {
         const sStore = d.createObjectStore(cardTable, { keyPath: "id" });
         sStore.createIndex("last", "last");
         sStore.createIndex("next", "next");
      }
   };
});

export const clear = () =>
   new Promise<void>((resolve, reject) => {
      db.close();
      const request = indexedDB.deleteDatabase("memword");
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const getMeta = <T>(key: kvKey) =>
   new Promise<T | undefined>((resolve, reject) => {
      const request = db
         .transaction(metaTable, "readonly")
         .objectStore(metaTable)
         .get(key);
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result?.value);
   });

export const setMeta = <T>(key: kvKey, value: T) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(metaTable, "readwrite")
         .objectStore(metaTable)
         .put({ key, value });
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const getIssues = () =>
   new Promise<Array<IIssue>>((resolve, reject) => {
      const request = db
         .transaction(issueTable, "readonly")
         .objectStore(issueTable)
         .getAll();
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result);
   });

export const addIssue = (issue: IIssue) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(issueTable, "readwrite")
         .objectStore(issueTable)
         .add(issue);
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const deleteIssue = (iid: number) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(issueTable, "readwrite")
         .objectStore(issueTable)
         .delete(iid);
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const getBook = (bid: string) =>
   new Promise<IBook | undefined>((resolve, reject) => {
      const request = db
         .transaction(bookTable, "readonly")
         .objectStore(bookTable)
         .get(bid);
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result);
   });

export const putBook = (book: IBook) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(bookTable, "readwrite")
         .objectStore(bookTable)
         .put(book);
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const deleteBook = (bid: string) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(bookTable, "readwrite")
         .objectStore(bookTable)
         .delete(bid);
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const getBooks = () =>
   new Promise<Array<IBook>>((resolve, reject) => {
      const request = db
         .transaction(bookTable, "readonly")
         .objectStore(bookTable)
         .getAll();
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result);
   });

export const syncBooks = (books: Array<IBook>) =>
   new Promise<Set<string>>((resolve, reject) => {
      const bookMap = new Map<string, IBook>();
      for (const book of books) bookMap.set(book.bid, book);
      const deleted = new Set<string>();
      const transaction = db.transaction(bookTable, "readwrite");
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve(deleted);
      const bStore = transaction.objectStore(bookTable);
      bStore.openCursor().onsuccess = (e) => {
         const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
         if (!cursor) {
            for (const [_, book] of bookMap) bStore.add(book);
            return;
         }
         const lbook = cursor.value as IBook;
         if (bookMap.has(lbook.bid)) {
            const sbook = bookMap.get(lbook.bid)!;
            if (sbook.checksum !== lbook.checksum) cursor.update(sbook);
            bookMap.delete(lbook.bid);
         } else {
            deleted.add(lbook.bid);
            cursor.delete();
         }
         cursor.continue();
      };
   });

export const getItem = (word: string) =>
   new Promise<IItem | undefined>((resolve, reject) => {
      const request = db
         .transaction(itemTable, "readonly")
         .objectStore(itemTable)
         .get(word);
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result);
   });

export const putItem = (item: IItem) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(itemTable, "readwrite")
         .objectStore(itemTable)
         .put(item);
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const deleteItem = (word: string) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(itemTable, "readwrite")
         .objectStore(itemTable)
         .delete(word);
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const getItems = (lastgte: number) =>
   new Promise<Array<IItem>>((resolve, reject) => {
      const request = db
         .transaction(itemTable, "readonly")
         .objectStore(itemTable)
         .index("last")
         .getAll(IDBKeyRange.lowerBound(lastgte));
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result);
   });

export const addTasks = (words: Iterable<string>) =>
   new Promise<void>((resolve, reject) => {
      const time = Date.now();
      const transaction = db.transaction(itemTable, "readwrite");
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve();
      const iStore = transaction.objectStore(itemTable);
      for (const word of words)
         iStore.get(word).onsuccess = (e) => {
            const item = (e.target as IDBRequest<IItem>).result;
            if (!item) iStore.add(neverItem(word, time));
         };
   });

export const syncTasks = (tasks: Iterable<ITask>) =>
   new Promise<void>((resolve, reject) => {
      const taskMap = new Map<string, ITask>();
      for (const task of tasks) taskMap.set(task.word, task);
      const transaction = db.transaction(itemTable, "readwrite");
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve();
      const iStore = transaction.objectStore(itemTable);
      iStore.openCursor().onsuccess = (e) => {
         const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
         if (!cursor) {
            for (const [_, task] of taskMap) iStore.add(task);
            return;
         }
         const item = cursor.value as IItem;
         if (taskMap.has(item.word)) {
            const task = taskMap.get(item.word)!;
            if (task.last > item.last) cursor.update(mergeTrace(item, task));
            taskMap.delete(item.word);
         } else cursor.delete();
         cursor.continue();
      };
   });

export const updateDict = (dict: IDict) =>
   new Promise<IItem | undefined>((resolve, reject) => {
      let item: IItem;
      const transaction = db.transaction(itemTable, "readwrite");
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve(item);
      const iStore = transaction.objectStore(itemTable);
      iStore.get(dict.word).onsuccess = (e1) => {
         item = (e1.target as IDBRequest<IItem>).result;
         if (item) {
            item.dictSync = Date.now();
            iStore.put(itemMergeDict(item, dict));
         }
      };
   });

export const getEpisode = (filter?: (item: IItem) => boolean) =>
   new Promise<Array<IItem>>((resolve, reject) => {
      const result: Array<IItem> = [];
      const transaction = db.transaction(itemTable, "readonly");
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve(result);
      transaction
         .objectStore(itemTable)
         .index("next")
         .openCursor(IDBKeyRange.upperBound(Date.now()), "prev").onsuccess = (
         e,
      ) => {
         const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
         if (!cursor) return;
         const item = cursor.value as IItem;
         if (!filter || filter(item)) result.push(item);
         if (result.length > 1) return;
         cursor.continue();
      };
   });

export const getStats = (books: Array<IBook>) =>
   new Promise<Array<IStat>>((resolve, reject) => {
      const time = Date.now();
      const tstat = initStat(time, undefined, "全部词汇");
      const stats: Array<IStat> = books.map((book) =>
         initStat(time, book.bid, book.disc),
      );
      const wordSets = books.map((book) => new Set<string>(book.content));
      const transaction = db.transaction(itemTable, "readonly");
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve([tstat, ...stats]);
      transaction.objectStore(itemTable).openCursor().onsuccess = (e) => {
         const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
         if (!cursor)
            return stats.forEach(
               (stat, i) => (stat.total[0] += wordSets[i].size),
            );
         const item = cursor.value as IItem;
         addTaskToStat(tstat, item);
         stats.forEach(
            (stat, i) =>
               wordSets[i].has(item.word) &&
               (addTaskToStat(stat, item), wordSets[i].delete(item.word)),
         );
         cursor.continue();
      };
   });

export const studied = (word: string, level?: number) =>
   new Promise<IItem>((resolve, reject) => {
      let item: IItem;
      const transaction = db.transaction(itemTable, "readwrite");
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve(item);
      const iStore = transaction.objectStore(itemTable);
      iStore.get(word).onsuccess = (e2) => {
         const item1 = (e2.target as IDBRequest<IItem>).result;
         if (item1) {
            item = studyTask(item1, level);
            iStore.put(item);
         } else {
            item = studyTask(neverItem(word, Date.now()), level);
            iStore.add(item);
         }
      };
   });

export const addCard = (card: ICard) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(cardTable, "readwrite")
         .objectStore(cardTable)
         .add(card);
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const putCard = (card: ICard) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(cardTable, "readwrite")
         .objectStore(cardTable)
         .put(card);
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const deleteCard = (id: string) =>
   new Promise<void>((resolve, reject) => {
      const request = db
         .transaction(cardTable, "readwrite")
         .objectStore(cardTable)
         .delete(id);
      request.onerror = reject;
      request.onsuccess = () => resolve();
   });

export const getCards = (lastgte: number) =>
   new Promise<Array<ICard>>((resolve, reject) => {
      const request = db
         .transaction(cardTable, "readonly")
         .objectStore(cardTable)
         .index("last")
         .getAll(IDBKeyRange.lowerBound(lastgte));
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result);
   });

export const getCardEpisode = () =>
   new Promise<Array<ICard>>((resolve, reject) => {
      const result: Array<ICard> = [];
      const transaction = db.transaction(cardTable, "readonly");
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve(result);
      transaction
         .objectStore(cardTable)
         .index("next")
         .openCursor(IDBKeyRange.upperBound(Date.now()), "prev").onsuccess = (
         e,
      ) => {
         const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
         if (!cursor) return;
         result.push(cursor.value);
         if (result.length > 1) return;
         cursor.continue();
      };
   });

export const syncCards = (traces: Iterable<IIDTrace>) =>
   new Promise<void>((resolve, reject) => {
      const traceMap = new Map<string, IIDTrace>();
      for (const trace of traces) if (trace.id) traceMap.set(trace.id, trace);
      const transaction = db.transaction(cardTable, "readwrite");
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve();
      const cStore = transaction.objectStore(cardTable);
      cStore.openCursor().onsuccess = (e) => {
         const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
         if (!cursor) {
            for (const [_, card] of traceMap) cStore.add(card);
            return;
         }
         const card = cursor.value as ICard;
         if (traceMap.has(card.id)) {
            const trace = traceMap.get(card.id)!;
            if (trace.last > card.last) cursor.update(mergeTrace(card, trace));
            traceMap.delete(card.id);
         } else cursor.delete();
         cursor.continue();
      };
   });
