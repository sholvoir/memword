import { createSignal } from "solid-js";
import type { TDialog } from "../lib/idialog.ts";
import type { IUser } from "../lib/iuser.ts";
import * as mem from "../lib/mem.ts";

let timeout: number | undefined;
export const [page, setPage] = createSignal<TDialog>("#empty");
const [tips, setTips] = createSignal<string>();
const [sversion, setSVersion] = createSignal("");
export const [user, setUser] = createSignal<IUser>();
export const [loading, showLoading] = createSignal(false);

export { tips, sversion };

export const initUser = async () => setUser(await mem.getUser());

export const initSVersion = async () => {
   const v = await mem.getLocalServerVersion();
   if (v) setSVersion(v);
   const nv = await mem.getServerVersion();
   if (nv) mem.setLocalServerVersion(setSVersion(nv));
};

export const showTips = (content?: string, autohide = true) => {
   setTips(content);
   if (autohide) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(setTips, 3000);
   }
};

export const go = (d?: TDialog) => {
   if (!d) d = user()?.name ? "#home" : "#about";
   mem.setPage(setPage(d));
};
