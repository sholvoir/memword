import type { IDict } from "@sholvoir/dict-server/src/lib/imic.ts";
import { getJson, jsonInit, textHeader, url } from "@sholvoir/generic/http";
import { type IBook, splitID } from "#srv/lib/ibook.ts";
import type { ISetting } from "#srv/lib/isetting.ts";
import type { ITask } from "#srv/lib/itask.ts";

const API_BASE = "https://memword.micinfotech.com/api/v2";
const COMMON_BOOK_BASE_URL = "https://www.micinfotech.com/vocabulary";
const DICT_API_BASE =
   window.location.hostname === "localhost"
      ? "http://localhost:8080/api/v2"
      : "https://dict.micinfotech.com/api/v2";

export const token = await (async () => {
   const res = await getJson<{ token: string }>(`${API_BASE}/token`);
   return res?.token;
})();

const authHeader = { Authorization: `Bearer ${token}` };

export const otp = (name: string) => fetch(url(`${API_BASE}/otp`, { name }));

export const signup = (phone: string, name: string) =>
   fetch(url(`${API_BASE}/signup`, { phone, name }));

export const signin = (name: string, code: string) =>
   fetch(url(`${API_BASE}/signin`, { name, code }));

export const renew = (auth?: string) =>
   fetch(url(`${API_BASE}/renew`, { auth }));

export const getDict = (word: string) =>
   getJson<IDict>(url(`${DICT_API_BASE}/dict`, { q: word, mic: "1" }));

export const postTasks = (tasks: Array<ITask>) =>
   fetch(`${API_BASE}/task`, jsonInit(tasks));

export const deleteTasks = (words: Array<string>) =>
   fetch(`${API_BASE}/task`, jsonInit(words, "DELETE"));

export const putTask = (task: ITask) =>
   fetch(`${API_BASE}/task`, jsonInit(task, "PUT"));

export const getBooks = async () => {
   const books = (await getJson<Array<IBook>>(`${API_BASE}/book`)) ?? [];
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
      if (!res.ok) return;
      return await res.text();
   } else {
      const res = await fetch(`${API_BASE}/book/${bid}`);
      if (!res.ok) return;
      return await res.text();
   }
};

export const uploadBook = (
   name: string,
   words: string,
   disc?: string,
   isPublic?: boolean,
   replace?: boolean,
) =>
   fetch(
      url(`${API_BASE}/book`, {
         name,
         disc,
         public: isPublic ? "1" : undefined,
      }),
      {
         body: words,
         headers: textHeader,
         method: replace ? "PUT" : "POST",
      },
   );

export const deleteBook = (name: string) =>
   fetch(url(`${API_BASE}/book`, { name }), { method: "DELETE" });

export const getVocabularyChecksum = () =>
   getJson<{ checksum: string }>(`${DICT_API_BASE}/vocabulary/checksum`);

export const getVocabulary = () =>
   getJson<{ words: Array<string>; checksum: string }>(
      `${DICT_API_BASE}/vocabulary`,
   );

export const getSound = (surl: string) =>
   fetch(url(`${DICT_API_BASE}/sound`, { q: surl }), { cache: "force-cache" });

export const postSetting = (setting: ISetting) =>
   fetch(`${API_BASE}/setting`, jsonInit(setting));

export const postIssue = (issue: string) =>
   fetch(`${API_BASE}/issue`, jsonInit({ issue }));

export const postDictIssue = (issue: string) =>
   fetch(`${DICT_API_BASE}/issue`, jsonInit({ issue }, "POST", authHeader));
