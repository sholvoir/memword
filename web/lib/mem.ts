// deno-lint-ignore-file no-empty no-cond-assign

import { blobToBase64 } from "@sholvoir/generic/blob";
import { STATUS_CODE } from "@sholvoir/generic/http";
import { JWT } from "@sholvoir/generic/jwt";
import { now } from "@sholvoir/memword-common/common";
import { type IBook, splitID } from "@sholvoir/memword-common/ibook";
import {
   defaultSetting,
   type ISetting,
} from "@sholvoir/memword-common/isetting";
import { dictExpire } from "./common.ts";
import { type IItem, item2task, itemMergeDict, newItem } from "./iitem.ts";
import * as idb from "./indexdb.ts";
import { type IStats, statsFormat } from "./istat.ts";
import * as srv from "./server.ts";

export const user = await (async () => {
   const auth = (await idb.getMeta("_auth")) as string;
   if (!auth) return "";
   return (JWT.decode(auth)[1]?.aud as string) ?? "";
})();

export let setting: ISetting =
   ((await idb.getMeta("_setting")) as ISetting) ?? defaultSetting();

export const syncSetting = async (cSetting?: ISetting) => {
   if (cSetting && cSetting.version > setting.version) setting = cSetting;
   const lSetting = (await idb.getMeta("_setting")) as ISetting;
   if (lSetting && lSetting.version >= setting.version) setting = lSetting;
   else await idb.setMeta("_setting", setting);
   try {
      const res = await srv.postSetting(setting);
      if (!res.ok) return;
      const sSetting: ISetting = await res.json();
      if (sSetting.version > setting.version)
         await idb.setMeta("_setting", (setting = sSetting));
   } catch {}
};

export const updateDict = async (item: IItem) => {
   const dict = await srv.getDict(item.word);
   if (!dict) return item;
   if (
      item.version !== undefined &&
      dict.version !== undefined &&
      item.version >= dict.version
   )
      return item;
   if (dict.entries)
      for (const entry of dict.entries)
         if (entry.sound) {
            const resp = await srv.getSound(entry.sound);
            if (resp.ok) entry.sound = await blobToBase64(await resp.blob());
         }
   item.dictSync = now();
   idb.putItem(itemMergeDict(item, dict));
   return item;
};

const itemUpdateDict = async (item: IItem) => {
   if (!item.dictSync) return await updateDict(item);
   if (item.dictSync + dictExpire < now()) updateDict(item);
   return item;
};

export const search = async (word: string) => {
   if (idb.tempItems.has(word)) return idb.tempItems.get(word)!;
   const item = await idb.getItem(word);
   if (!item) {
      try {
         const dict = await srv.getDict(word);
         if (!dict) return;
         const nitem = newItem(dict);
         idb.tempItems.set(word, nitem);
         return nitem;
      } catch {
         return;
      }
   }
   return await itemUpdateDict(item);
};

export const getEpisode = async (bid?: string) => {
   let items: Array<IItem>;
   if (bid) {
      const wordSet = (await getBook(bid))?.content as Set<string>;
      items = await idb.getEpisode((word) => wordSet.has(word));
   } else items = await idb.getEpisode();
   if (items[1]) itemUpdateDict(items[1]);
   if (items[0]) return await itemUpdateDict(items[0]);
};

export const deleteItem = async (word: string) => {
   try {
      const resp = await srv.deleteTasks([word]);
      if (!resp.ok) return console.error("Fail for delete task");
      await idb.deleteItem(word);
      return true;
   } catch {
      console.error("Network Error: delete task data error.");
      return false;
   }
};

export const addTasks = async (bid: string) => {
   const book = await getBook(bid);
   if (book?.content) {
      await idb.addTasks(book.content);
      return true;
   }
   return false;
};

export const syncTasks = async () => {
   try {
      const thisTime = now();
      const lastTime = ((await idb.getMeta("_sync-time")) ?? 1) as number;
      const tasks = (await idb.getItems(lastTime)).map(item2task);
      const resp = await srv.postTasks(tasks);
      if (!resp.ok)
         return console.error("Network Error: get sync task data error.");
      const ntasks = await resp.json();
      await idb.mergeTasks(ntasks);
      await idb.setMeta("_sync-time", thisTime);
      return true;
   } catch {
      return false;
   }
};

const submitIssues = async () => {
   const issues = await idb.getIssues();
   for (const issue of issues) {
      const res = await srv.postIssue(issue.issue);
      if (!res.ok) break;
      await idb.deleteIssue(issue.iid!);
   }
};

export const submitIssue = async (issue: string) => {
   await idb.addIssue(issue);
   submitIssues();
};

export const totalStats = async () => {
   const books: Array<IBook> = [];
   for (const bid of setting.books) {
      const book = await getBook(bid);
      if (book) books.push(book);
   }
   return { format: statsFormat, stats: await idb.getStats(books) } as IStats;
};

export const getServerBooks = async () => {
   const books = await srv.getBooks();
   if (books.length) {
      const time = now();
      const deleted = await idb.syncBooks(books);
      const setting = (await idb.getMeta("_setting")) as ISetting;
      if (setting?.books.length) {
         const nbooks = setting.books.filter((bid) => !deleted.has(bid));
         if (nbooks.length !== setting.books.length) {
            setting.books = nbooks;
            setting.version = time;
            await idb.setMeta("_setting", setting);
         }
      }
   }
};

export const getBook = async (bid: string) => {
   const book = await idb.getBook(bid);
   if (!book) return undefined;
   if (book.content) return book;
   const text = await srv.getBook(bid);
   if (!text) return undefined;
   const content = new Set<string>();
   for (let word of text.split("\n"))
      if ((word = word.trim())) content.add(word);
   book.content = content;
   idb.putBook(book);
   return book;
};

export const getVocabulary = async (): Promise<
   [Set<string>, () => Promise<Set<string> | undefined>]
> => {
   const [vocab, checksum] = ((await idb.getMeta("_vocabulary")) as [
      Set<string>,
      string,
   ]) ?? [new Set<string>(), ""];
   return [
      vocab,
      async () => {
         const resChecksum = await srv.getVocabularyChecksum();
         if (!resChecksum) return;
         const sChecksum = resChecksum.checksum;
         if (!sChecksum || sChecksum === checksum) return;
         const resVocabulary = await srv.getVocabulary();
         if (!resVocabulary) return;
         const { words, checksum: sCheckSum2 } = resVocabulary;
         const nvocab = new Set<string>();
         for (let word of words) if ((word = word.trim())) nvocab.add(word);
         await idb.setMeta("_vocabulary", [nvocab, sCheckSum2]);
         return nvocab;
      },
   ];
};

export const uploadBook = async (
   name: string,
   words: string,
   disc?: string,
   replace?: boolean,
) => {
   const res = replace
      ? await srv.putBook(name, words, disc)
      : await srv.postBook(name, words, disc);
   switch (res.status) {
      case STATUS_CODE.NotAcceptable:
         return [res.status, await res.json()];
      case STATUS_CODE.OK: {
         idb.putBook(await res.json());
         return [res.status];
      }
      default:
         return [res.status];
   }
};

export const deleteBook = async (bid: string) => {
   try {
      const name = splitID(bid)[1];
      const res = await srv.deleteBook(name);
      if (res.ok) await idb.deleteBook(bid);
      return res.ok;
   } catch {
      return false;
   }
};

export const signin = async (name: string, code: string) => {
   const res = await srv.signin(name, code);
   if (res.ok) await idb.setMeta("_auth", (await res.json()).auth);
   console.log(`signin ${res.status}`);
   return res.status;
};
