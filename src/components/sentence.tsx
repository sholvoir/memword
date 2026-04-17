import { createResource, createSignal, Show } from "solid-js";
import type { ISentence } from "#srv/lib/isentence.ts";
import { item2task } from "../lib/iitem.ts";
import * as idb from "../lib/indexdb.ts";
import { sentenceToWords, studySentence } from "../lib/isentence.ts";
import * as srv from "../lib/server.ts";
import Dialog from "./dialog-e.tsx";
import { useG } from "./g-provider.tsx";

export default (props: {
   lamma: Record<string, string>;
   totalStats: () => void;
   vocabulary: Set<string>;
}) => {
   const [sentence, setSentence] = createSignal<ISentence>();
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [sprint, setSprint] = createSignal(0);
   const { go, showTips } = useG()!;
   const speechs = new Map<string, SpeechSynthesisUtterance>();
   const finish = () => {
      go("#home");
      props.totalStats();
   };
   const speak = () => {
      if (sentence()) {
         const st = sentence()!.sentence;
         let utterance = speechs.get(st);
         if (!utterance) {
            utterance = new SpeechSynthesisUtterance(st);
            utterance.lang = "en-US";
            utterance.rate = 0.8;
            utterance.voice = speechSynthesis
               .getVoices()
               .find((voice) => voice.name === "Google US English")!;
            speechs.set(st, utterance);
         }
         speechSynthesis.speak(utterance);
      }
   };
   const studyNext = async () => {
      const st = await idb.getStEpisode();
      if (!st) {
         showTips("No More Sentence!");
         setSentence();
         setPhaseAnswer(false);
      } else {
         if (!st.trans) {
            let t = await srv.getSentence(st.sentence);
            if (!t) t = await srv.postTrans(st.sentence);
            if (t) st.trans = t;
         }
         setSentence(st);
         setSprint((s) => s + 1);
         setPhaseAnswer(false);
         speak();
      }
   };
   const handleIKnown = async (know?: boolean) => {
      if (sentence()) {
         const st = studySentence(sentence()!, know);
         await idb.putSentence(st);
         delete st.trans;
         await srv.postSentences([st]);
         if (know) {
            const items = [];
            const result = sentenceToWords(
               props.vocabulary,
               props.lamma,
               st.sentence,
            );
            if (result.words)
               for (const word of result.words) {
                  items.push(await idb.studied(word));
               }
            if (items.length) srv.postTasks(items.map(item2task));
         }
      }
   };
   const handleClick = () => {
      if (!isPhaseAnswer()) setPhaseAnswer(true);
      speak();
   };
   const handleKeyPress = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.ctrlKey || e.altKey) return;
      switch (e.key) {
         case " ":
            speak();
            break;
         case "N":
         case "X":
         case "n":
         case "x":
            if (isPhaseAnswer()) handleIKnown(true).then(studyNext);
            break;
         case "M":
         case "Z":
         case "m":
         case "z":
            if (isPhaseAnswer()) handleIKnown().then(studyNext);
            break;
      }
   };
   createResource(studyNext);
   return (
      <Dialog
         class="h-full p-2 outline-none relative flex flex-col text-lg"
         title={`句子${sprint() > 0 ? `(${sprint()})` : ""}`}
         leftClick={finish}
         onClick={handleClick}
         onKeyup={handleKeyPress}
         touchEnabled={isPhaseAnswer()}
         beforeAnimation={handleIKnown}
         afterAnimation={studyNext}
      >
         <Show when={sentence()}>
            <div>{sentence()!.sentence}</div>
            <Show when={isPhaseAnswer()}>
               <div class="grow">{sentence()!.trans}</div>
            </Show>
         </Show>
      </Dialog>
   );
};
