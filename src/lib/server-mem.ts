import type { WithID } from "@sholvoir/dict-server/src/lib/common.ts";
import {
   getJson,
   getText,
   jsonInit,
   textInit,
   url,
} from "@sholvoir/generic/http";
import type { ISetting } from "@sholvoir/memword-server/src/lib/isetting.ts";
import type { ITask } from "../lib/iitem.ts";
import type { IBook } from "./ibook.ts";
import type { ICard } from "./icard.ts";
import type { ITrace } from "./itrace.ts";
import type { IUser } from "./iuser.ts";

const API_BASE = "/api/v2";

export const signup_get = (phone: string, name: string) =>
   fetch(url("/signup", { phone, name }));
export const otp_get = (name: string) => fetch(url("/otp", { name }));
export const signin_get = (name: string, code: string) =>
   fetch(url("/signin", { name, code }));
export const renew_get = (auth?: string) =>
   getJson<IUser>(url("/renew", { auth }));
export const signout_get = () => fetch("/signout");

export const book_get = () => getJson<Array<IBook>>(`${API_BASE}/book`);
export const book_delete = (name: string) =>
   fetch(url(`${API_BASE}/book`, { name }), { method: "DELETE" });
export const book_patch = (
   words: string,
   option: { name: string; disc?: string; public?: "1" },
) => fetch(url(`${API_BASE}/book`, option), textInit(words, "PATCH"));
export const book_put = (
   words: string,
   option: { name: string; disc?: string; public?: "1" },
) => fetch(url(`${API_BASE}/book`, option), textInit(words, "PUT"));
export const book_id_get = (bookId: string) =>
   getText(`${API_BASE}/book/${bookId}`);

export const issue_post = (issue: string) =>
   fetch(`${API_BASE}/issue`, textInit(issue));
export const dictIssue_post = (issue: string) =>
   fetch(`${API_BASE}/dict-issue`, textInit(issue));

export const card_get = () =>
   getJson<Array<WithID<ITrace>>>(`${API_BASE}/card`);
export const card_patch = (traces: Array<WithID<ICard>>) =>
   fetch(`${API_BASE}/card`, jsonInit(traces, "PATCH"));
export const card_delete = (ids: Array<string>) =>
   fetch(`${API_BASE}/card`, jsonInit(ids, "DELETE"));
export const card_post = (card: ICard) =>
   getText(`${API_BASE}/card`, jsonInit(card, "POST"));
export const card_id_get = (id: string) => getText(`${API_BASE}/card/${id}`);

export const setting_post = (setting: ISetting) =>
   getJson<ISetting>(`${API_BASE}/setting`, jsonInit(setting));

export const task_get = () => getJson<Array<ITask>>(`${API_BASE}/task`);
export const task_patch = (traces: Array<ITask>) =>
   fetch(`${API_BASE}/task`, jsonInit(traces, "PATCH"));
export const task_delete = (words: Array<string>) =>
   fetch(`${API_BASE}/task`, jsonInit(words, "DELETE"));

export const trans_post = (sentence: string) =>
   getText(`${API_BASE}/trans`, textInit(sentence));
export const version_get = () => getText(`${API_BASE}/version`);
