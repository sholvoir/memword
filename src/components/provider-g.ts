import { createSignal } from "solid-js";
import type { TDialog } from "../lib/idialog.ts";
import type { IUser } from "../lib/iuser.ts";
import * as mem from "../lib/mem.ts";

let timeout: number | undefined;
const [page, setPage] = createSignal<TDialog>("#empty");
const [tips, setTips] = createSignal<string>();
export { tips, page };
export const [user, setUser] = createSignal<IUser>();
export const [loading, showLoading] = createSignal(false);
export const showTips = (content?: string, autohide = true) => {
   setTips(content);
   if (autohide) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(setTips, 3000);
   }
};
export const go = (d?: TDialog) => {
   if (!d) d = user()?.name ? "#home" : "#about";
   setPage(d);
   mem.setPage(d);
};
