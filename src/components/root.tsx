import { createEffect, createSignal, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { IBook } from "../lib/ibook.ts";
import type { TDial } from "../lib/idial.ts";
import type { IItem } from "../lib/iitem.ts";
import { type IStats, initStats } from "../lib/istat.ts";
import * as mem from "../lib/mem.ts";
import About from "./about.tsx";
import Book from "./book.tsx";
import { useG } from "./g-provider.tsx";
import Help from "./help.tsx";
import Home from "./home.tsx";
import Issue from "./issue.tsx";
import Dict from "./search.tsx";
import Sentence from "./sentence.tsx";
import Setting from "./setting.tsx";
import Study from "./study.tsx";
import Trans from "./trans.tsx";

export default () => {
   const [stats, setStats] = createSignal<IStats>(initStats());
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [citem, setCItem] = createSignal<IItem>();
   const [bid, setBId] = createSignal<string>();
   const [sprint, setSprint] = createSignal(-1);
   const [book, setBook] = createSignal<IBook>();
   const [vocabulary, setVocabulary] = createSignal<Set<string>>(new Set());
   const [lamma, setLamma] = createSignal<Record<string, string>>({});
   const { go, loca } = useG()!;

   const totalStats = async () => setStats(await mem.totalStats());

   const dialogs = new Map<TDial, () => JSX.Element>();
   dialogs.set("#help", () => <Help />);
   dialogs.set("#about", () => <About />);
   dialogs.set("#issue", () => <Issue />);
   dialogs.set("#book", () => <Book book={book()} />);
   dialogs.set("#trans", () => (
      <Trans vocabulary={vocabulary()} lamma={lamma()} />
   ));
   dialogs.set("#sentence", () => (
      <Sentence vocabulary={vocabulary()} lamma={lamma()} />
   ));
   dialogs.set("#home", () => (
      <Home
         setBId={setBId}
         setCItem={setCItem}
         setPhaseAnswer={setPhaseAnswer}
         setSprint={setSprint}
         stats={stats}
         totalStats={totalStats}
      />
   ));
   dialogs.set("#setting", () => (
      <Setting setBook={setBook} totalStats={totalStats} />
   ));
   dialogs.set("#search", () => (
      <Dict
         setCItem={setCItem}
         setPhaseAnswer={setPhaseAnswer}
         setSprint={setSprint}
         vocabulary={vocabulary}
      />
   ));
   dialogs.set("#study", () => (
      <Study
         bid={bid}
         citem={citem}
         isPhaseAnswer={isPhaseAnswer}
         setCItem={setCItem}
         setPhaseAnswer={setPhaseAnswer}
         setSprint={setSprint}
         sprint={sprint}
         totalStats={totalStats}
         vocabulary={vocabulary}
      />
   ));

   const init = async () => {
      if (mem.user) {
         go("#home");
         await totalStats();
         (async () => {
            await mem.getServerBooks();
            const [vocab, updatedVobab] = await mem.getVocabulary();
            if (vocab.size) setVocabulary(vocab);
            updatedVobab().then((nvocab) => nvocab && setVocabulary(nvocab));
            const la = await mem.getLamma();
            if (la) setLamma(la);
            await mem.syncSetting();
            await mem.syncTasks();
            await mem.syncSentences();
            await totalStats();
         })();
      } else go("#about");
   };

   createEffect(() => {
      init();
   });
   return (
      <Dynamic
         component={dialogs.get(loca() ?? (mem.user ? "#home" : "#about"))}
      ></Dynamic>
   );
};
