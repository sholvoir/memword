import type { IDict, IEntry } from "@sholvoir/dict/server/src/lib/imic.ts";
import { type IBook, splitID } from "#srv/lib/ibook.ts";
import type { IIssue } from "#srv/lib/iissue.ts";
import type { ISetting } from "#srv/lib/isetting.ts";
import type { ITask } from "#srv/lib/itask.ts";
import { COMMON_BOOK_BASE_URL } from "./common.ts";
import { API_BASE, DICT_API_BASE } from "#srv/lib/common.ts";
import * as idb from "./indexdb.ts";

const token = await idb.getMeta("_auth");

const authHeader = { Authorization: `Bearer ${token}` };
const jsonHeader = { "Content-Type": "application/json" };
const textHeader = { "Content-Type": "text/plain" };

const url = (
   path: string,
   query?: Record<string, string | undefined | null>,
) => {
   const u = new URL(path, location.href);
   if (query)
      for (const [key, value] of Object.entries(query))
         if (key && value) u.searchParams.append(key, value);
   return u;
};

export const getJson = async <T>(
   input: string | URL | Request,
   init?: RequestInit,
): Promise<T | undefined> => {
   const res = await fetch(input, init);
   if (!res.ok) return undefined;
   return (await res.json()) as T;
};

export const otp = (name: string) => fetch(url(`${API_BASE}/otp`, { name }));

export const signup = (phone: string, name: string) =>
   fetch(url(`${API_BASE}/signup`, { phone, name }));
export const signin = (name: string, code: string) =>
   fetch(url(`${API_BASE}/signin`, { name, code }));

export const getDefinition = (word: string) =>
   getJson<IEntry>(url(`${API_BASE}/definition`, { q: word }));

export const getDict = (word: string) =>
   getJson<IDict>(url(`${API_BASE}/dict`, { q: word }), { cache: "reload" });

export const putDict = (dict: IDict) =>
   fetch(`${API_BASE}/dict`, {
      body: JSON.stringify(dict),
      headers: { ...jsonHeader, ...authHeader },
      method: "PUT",
   });

export const deleteDict = (word: string) =>
   fetch(url(`${API_BASE}/dict`, { q: word }), {
      headers: authHeader,
      method: "DELETE",
   });

export const postTasks = (tasks: Array<ITask>) =>
   fetch(`${API_BASE}/task`, {
      body: JSON.stringify(tasks),
      headers: { ...jsonHeader, ...authHeader },
      method: "POST",
   });

export const deleteTasks = (words: Array<string>) =>
   fetch(`${API_BASE}/task`, {
      body: JSON.stringify(words),
      headers: { ...jsonHeader, ...authHeader },
      method: "DELETE",
   });

export const putTask = (task: ITask) =>
   fetch(`${API_BASE}/task`, {
      body: JSON.stringify(task),
      headers: { ...jsonHeader, ...authHeader },
      method: "PUT",
   });

export const getBooks = async () => {
   const books =
      (await getJson<Array<IBook>>(`${API_BASE}/book`, {
         headers: authHeader,
      })) ?? [];
   const res = await fetch(`${COMMON_BOOK_BASE_URL}/checksum.json`);
   if (!res.ok) return books;
   const checksums: Record<string, { disc: string; checksum: string }> =
      await res.json();
   for (const [bname, { disc, checksum }] of Object.entries(checksums))
      books.push({
         bid: `common/${bname}`,
         disc,
         checksum,
         public: true,
      });
   return books;
};

export const getBook = async (bid: string) => {
   const [username, bname] = splitID(bid);
   if (username === "common") {
      const res = await fetch(`${COMMON_BOOK_BASE_URL}/${bname}.txt`);
      if (!res.ok) return undefined;
      return await res.text();
   } else {
      const res = await fetch(`${API_BASE}/book/${bid}`, {
         headers: authHeader,
      });
      if (!res.ok) return undefined;
      return await res.text();
   }
};

export const postBook = (name: string, words: string, disc?: string) =>
   fetch(url(`${API_BASE}/book`, { name, disc }), {
      body: words,
      headers: { ...textHeader, ...authHeader },
      method: "POST",
   });

export const putBook = (name: string, words: string, disc?: string) =>
   fetch(url(`${API_BASE}/book`, { name, disc }), {
      body: words,
      headers: { ...textHeader, ...authHeader },
      method: "PUT",
   });

export const deleteBook = (name: string) =>
   fetch(url(`${API_BASE}/book`, { name }), {
      headers: authHeader,
      method: "DELETE",
   });

export const getVocabularyChecksum = () =>
   getJson<{ checksum: string }>(`${API_BASE}/vocabulary/checksum`);
export const getVocabulary = () =>
   getJson<{ words: Array<string>; checksum: string }>(`${API_BASE}/vocabulary`);
export const postVocabulary = (words: string) =>
   fetch(`${API_BASE}/vocabulary`, {
      body: words,
      headers: { ...textHeader, ...authHeader },
      method: "POST",
   });
export const deleteVocabulary = (words: string) =>
   fetch(`${API_BASE}/vocabulary`, {
      body: words,
      headers: { ...textHeader, ...authHeader },
      method: "DELETE",
   });

export const getSound = (surl: string) =>
   fetch(url(`${API_BASE}/sound`, { q: surl }), { cache: "force-cache" });

export const postSetting = (setting: ISetting) =>
   fetch(`${API_BASE}/setting`, {
      body: JSON.stringify(setting),
      headers: { ...jsonHeader, ...authHeader },
      method: "POST",
   });

export const getIssues = () =>
   getJson<Array<IIssue>>(`${API_BASE}/issue`, {
      headers: authHeader,
   });

export const postIssue = (issue: string) =>
   fetch(`${API_BASE}/issue`, {
      body: JSON.stringify({ issue }),
      headers: { ...jsonHeader, ...authHeader },
      method: "POST",
   });

export const deleteIssue = (_id: string) =>
   getJson(url(`${API_BASE}/issue`, { id: _id }), {
      headers: authHeader,
      method: "DELETE",
   });

export const getEcdictAsIssue = () =>
   fetch(`${API_BASE}/ecdict-as-issue`, {
      headers: authHeader,
   });
