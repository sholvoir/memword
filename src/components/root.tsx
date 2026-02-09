import { createEffect, createSignal, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { IBook } from "#srv/lib/ibook.ts";
import type { TDial } from "../lib/idial.ts";
import type { IItem } from "../lib/iitem.ts";
import { type IStats, initStats } from "../lib/istat.ts";
import * as mem from "../lib/mem.ts";
import About from "./about.tsx";
import Book from "./book.tsx";
import Help from "./help.tsx";
import Home from "./home.tsx";
import Issue from "./issue.tsx";
import Dict from "./search.tsx";
import Setting from "./setting.tsx";
import Study from "./study.tsx";

export default () => {
   const [user] = createSignal(
      document
         .querySelector("meta[name='username']")
         ?.getAttribute("content") ?? "",
   );
   const [stats, setStats] = createSignal<IStats>(initStats());
   const [tips, setTips] = createSignal("");
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [citem, setCItem] = createSignal<IItem>();
   const [bid, setBId] = createSignal<string>();
   const [sprint, setSprint] = createSignal(-1);
   const [book, setBook] = createSignal<IBook>();
   const [showLoading, setShowLoading] = createSignal(false);
   const [loca, setLoca] = createSignal<TDial>("#home");
   const [vocabulary, setVocabulary] = createSignal<Set<string>>(new Set());

   let timeout: NodeJS.Timeout | undefined;
   const totalStats = async () => setStats(await mem.totalStats());
   const hideTips = () => setTips("");
   const go = (d?: TDial) => setLoca(d ?? (user() ? "#home" : "#about"));
   const showTips = (content: string, autohide = true) => {
      setTips(content);
      if (autohide) {
         if (timeout) clearTimeout(timeout);
         timeout = setTimeout(hideTips, 3000);
      }
   };

   const dialogs = new Map<TDial, () => JSX.Element>();
   dialogs.set("#home", () => (
      <Home
         go={go}
         setBId={setBId}
         setCItem={setCItem}
         setPhaseAnswer={setPhaseAnswer}
         setShowLoading={setShowLoading}
         setSprint={setSprint}
         showLoading={showLoading}
         showTips={showTips}
         stats={stats}
         totalStats={totalStats}
      />
   ));
   dialogs.set("#help", () => <Help go={go} />);
   dialogs.set("#about", () => <About user={user} go={go} />);
   dialogs.set("#issue", () => (
      <Issue go={go} showTips={showTips} tips={tips} />
   ));
   dialogs.set("#setting", () => (
      <Setting
         go={go}
         setBook={setBook}
         setShowLoading={setShowLoading}
         showLoading={showLoading}
         showTips={showTips}
         tips={tips}
         user={user}
      />
   ));
   dialogs.set("#search", () => (
      <Dict
         go={go}
         setCItem={setCItem}
         setPhaseAnswer={setPhaseAnswer}
         setSprint={setSprint}
         showTips={showTips}
         vocabulary={vocabulary}
      />
   ));
   dialogs.set("#study", () => (
      <Study
         bid={bid}
         citem={citem}
         go={go}
         hideTips={hideTips}
         isPhaseAnswer={isPhaseAnswer}
         setCItem={setCItem}
         setPhaseAnswer={setPhaseAnswer}
         setSprint={setSprint}
         showTips={showTips}
         sprint={sprint}
         tips={tips}
         totalStats={totalStats}
         user={user}
         vocabulary={vocabulary}
      />
   ));
   dialogs.set("#book", () => (
      <Book go={go} book={book} showTips={showTips} user={user} />
   ));

   const init = async () => {
      if (user()) {
         go("#home");
         await totalStats();
         (async () => {
            await mem.getServerBooks();
            const [vocab, updatedVobab] = await mem.getVocabulary();
            if (vocab.size) setVocabulary(vocab);
            updatedVobab().then((nvocab) => nvocab && setVocabulary(nvocab));
            await mem.syncSetting();
            await mem.syncTasks();
            await totalStats();
         })();
      } else go("#about");
   };

   createEffect(() => {
      init();
   });
   return <Dynamic component={dialogs.get(loca())}></Dynamic>;
};
