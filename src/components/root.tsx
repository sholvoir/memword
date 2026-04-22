import { createSignal, type JSX, onMount } from "solid-js";
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
import Sentence from "./sentence.tsx";
import Setting from "./setting.tsx";
import Study from "./study.tsx";
import Trans from "./trans.tsx";

export default () => {
   // about
   const [sversion, setSversion] = createSignal("");
   // home
   const [stats, setStats] = createSignal<IStats>(initStats());
   // study, trans
   const [citem, setCItem] = createSignal<IItem>();
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [sprint, setSprint] = createSignal(-1);
   // book
   const [bid, setBId] = createSignal<string>();
   const [book, setBook] = createSignal<IBook>();
   // trans
   const [sentence, setSentence] = createSignal("");
   const [word, setWord] = createSignal("");
   const [trans, setTrans] = createSignal<string>("");
   // common
   const [vocabulary, setVocabulary] = createSignal<Set<string>>(new Set());
   const [lamma, setLamma] = createSignal<Record<string, string>>({});
   const { go, loca } = useG()!;

   const totalStats = async () => setStats(await mem.totalStats());

   const dialogs = new Map<TDial, () => JSX.Element>();
   dialogs.set("#help", () => <Help />);
   dialogs.set("#about", () => <About sversion={sversion()} />);
   dialogs.set("#issue", () => <Issue />);
   dialogs.set("#book", () => <Book book={book()} />);
   dialogs.set("#setting", () => (
      <Setting setBook={setBook} totalStats={totalStats} />
   ));
   dialogs.set("#sentence", () => (
      <Sentence
         lamma={lamma()}
         totalStats={totalStats}
         vocabulary={vocabulary()}
      />
   ));
   dialogs.set("#trans", () => (
      <Trans
         lamma={lamma()}
         sentence={sentence()}
         setCItem={setCItem}
         setPhaseAnswer={setPhaseAnswer}
         setSentence={setSentence}
         setSprint={setSprint}
         setTrans={setTrans}
         setWord={setWord}
         trans={trans()}
         vocabulary={vocabulary()}
         word={word}
      />
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

   onMount(async () => {
      if (mem.user) {
         go("#home");
         await totalStats();
         (async () => {
            setSversion((await mem.getLocalServerVersion()) ?? "");
            mem.getServerVersion().then((v) => {
               v && setSversion(v) && mem.setLocalServerVersion(v);
            });
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
   });
   return (
      <Dynamic
         component={dialogs.get(loca() ?? (mem.user ? "#home" : "#about"))}
      ></Dynamic>
   );
};
