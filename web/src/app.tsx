import type { IBook } from "@sholvoir/memword-common/ibook";
import { createSignal } from "solid-js";
import type { IItem } from "../lib/iitem.ts";
import { type IStats, initStats } from "../lib/istat.ts";
import * as mem from "../lib/mem.ts";

const DIALS = [
   "",
   "#home",
   "#help",
   "#about",
   "#issue",
   "#setting",
   "#book",
   "#search",
   "#study",
   "#signup",
   "#signin",
] as const;
export type TDial = (typeof DIALS)[number];

export const [user, setUser] = createSignal("");
export const [stats, setStats] = createSignal<IStats>(initStats());
export const [tips, setTips] = createSignal("");
export const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
export const [citem, setCItem] = createSignal<IItem>();
export const [bid, setBId] = createSignal<string>();
export const [sprint, setSprint] = createSignal(-1);
export const [name, setName] = createSignal("");
export const [book, setBook] = createSignal<IBook>();
export const [showLoading, setShowLoading] = createSignal(false);
export const [loca, setLoca] = createSignal<TDial>("");
export const [vocabulary, setVocabulary] = createSignal<Set<string>>(new Set());

let timeout: NodeJS.Timeout | undefined;
export const totalStats = async () => setStats(await mem.totalStats());
export const hideTips = () => setTips("");
export const go = (d?: TDial) => setLoca(d ?? (user() ? "#home" : "#about"));
export const showTips = (content: string, autohide = true) => {
   setTips(content);
   if (autohide) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(hideTips, 3000);
   }
};

export const startStudy = async (wl?: string) => {
   setShowLoading(true);
   const item = await mem.getEpisode(setBId(wl));
   setShowLoading(false);
   if (item) {
      setCItem(item);
      setPhaseAnswer(false);
      setSprint(0);
      go("#study");
   } else {
      showTips("No More Task");
      totalStats();
   }
};
