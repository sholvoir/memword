import {
   getJson,
   getText,
   jsonInit,
   textInit,
   url,
} from "@sholvoir/generic/http";
import type { ISetting } from "#srv/lib/isetting.ts";
import type { ITask } from "#srv/lib/itask.ts";
import type { IBook } from "./ibook.ts";
import type { IIssue } from "./iissue";
import type { ISentence } from "./isentence.ts";

const API_BASE = "/api/v2";

export const book_get = () => getJson<Array<IBook>>(`${API_BASE}/book`);

export const book_delete = (name: string) =>
   fetch(url(`${API_BASE}/book`, { name }), { method: "DELETE" });

export const book_post = (
   name: string,
   words: string,
   disc?: string,
   isPublic?: "1",
) =>
   fetch(
      url(`${API_BASE}/book`, { name, disc, public: isPublic }),
      textInit(words),
   );

export const book_put = (
   name: string,
   words: string,
   disc?: string,
   isPublic?: "1",
) =>
   fetch(
      url(`${API_BASE}/book`, { name, disc, public: isPublic }),
      textInit(words, "PUT"),
   );

export const book_id_get = (bookId: string) =>
   getText(`${API_BASE}/book/${bookId}`);

export const issue_post = (issue: IIssue) =>
   fetch(
      url(`${API_BASE}/issue`, { d: issue.d }),
      jsonInit({ issue: issue.issue }),
   );

export const otp_get = (name: string) =>
   fetch(url(`${API_BASE}/otp`, { name }));

export const renew_get = (auth?: string) =>
   fetch(url(`${API_BASE}/renew`, { auth }));

export const sentence_post = (sentences: Array<ISentence>, sync?: "1") =>
   fetch(url(`${API_BASE}/sentence`, { sync }), jsonInit(sentences));

export const sentence_get = (sentence: string) =>
   getText(url(`${API_BASE}/sentence`, { st: sentence }));

export const sentence_delete = (sentence: string) =>
   fetch(url(`${API_BASE}/sentence`, { st: sentence }), { method: "DELETE" });

export const setting_post = (setting: ISetting) =>
   getJson<ISetting>(`${API_BASE}/setting`, jsonInit(setting));

export const signin_get = (name: string, code: string) =>
   fetch(url(`${API_BASE}/signin`, { name, code }));

export const signup_get = (phone: string, name: string) =>
   fetch(url(`${API_BASE}/signup`, { phone, name }));

export const signout_get = () => fetch(`${API_BASE}/signout`);

export const task_post = (tasks: Array<ITask>, sync?: "1") =>
   fetch(url(`${API_BASE}/task`, { sync }), jsonInit(tasks));

export const task_delete = (words: Array<string>) =>
   fetch(`${API_BASE}/task`, jsonInit(words, "DELETE"));

export const trans_post = (sentence: string) =>
   getText(`${API_BASE}/trans`, textInit(sentence));

export const version_get = () => getText(`${API_BASE}/version`);

export const user_get = () => getJson<{ name: string }>(`${API_BASE}/user`);
