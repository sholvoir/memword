import BButton from "@sholvoir/solid-components/button-base";
import { createSignal, onMount, Show } from "solid-js";
import type { ISentence } from "#srv/lib/isentence.ts";
import {
   ST_MAX_LEVEL,
   sentenceToWords,
   studySentence,
} from "../lib/isentence.ts";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog-e.tsx";
import { go, showTips } from "./provider-g.ts";
import { lemma, totalStats, vocabulary } from "./provider-user.ts";

const speechs = new Map<string, SpeechSynthesisUtterance>();
const getUrrerance = (text: string) => {
   const utterance = new SpeechSynthesisUtterance(text);
   utterance.lang = "en-US";
   utterance.rate = 0.8;
   utterance.voice = speechSynthesis
      .getVoices()
      .find((voice) => voice.name === "Google US English")!;
   speechs.set(text, utterance);
   return utterance;
};

const speak = (text?: string) =>
   text && speechSynthesis.speak(speechs.get(text) ?? getUrrerance(text));

export default () => {
   const [sentence, setSentence] = createSignal<ISentence>();
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [sprint, setSprint] = createSignal(0);

   const studyNext = async () => {
      const st = await mem.getSentenceEpisode();
      if (!st) {
         showTips("No More Sentence!");
         setSentence();
         setPhaseAnswer(false);
      } else {
         if (!st.trans) {
            let t = await mem.getServerCachedTrans(st.sentence);
            if (!t) t = await mem.baiduTranslate(st.sentence);
            if (t) st.trans = t;
         }
         setSentence(st);
         setSprint((s) => s + 1);
         setPhaseAnswer(false);
         speak(st.sentence);
      }
   };
   const handleIKnown = async (know?: boolean) => {
      if (sentence()) {
         const st = studySentence(sentence()!, know);
         if (st.level === ST_MAX_LEVEL) {
            await mem.deleteLocalSentence(st.sentence);
            mem.deleteSentence(st.sentence);
         } else {
            await mem.setLocalSentence(st);
            delete st.trans;
            mem.uploadSentences([st]);
         }
         if (know) {
            const items = [];
            const result = sentenceToWords(vocabulary(), lemma(), st.sentence);
            if (result.words)
               for (const word of result.words) {
                  items.push(await mem.studyWord(word));
               }
            if (items.length) mem.uploadTasks(items);
         }
      }
   };
   const handleClick = () => {
      if (!isPhaseAnswer()) setPhaseAnswer(true);
      speak(sentence()?.sentence);
   };
   const handleKeyPress = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.ctrlKey || e.altKey) return;
      switch (e.key) {
         case " ":
            handleClick();
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
   const handleDelete = async () => {
      const st = sentence()?.sentence;
      if (st) {
         try {
            await mem.deleteLocalSentence(st);
            showTips("删除成功");
            mem.deleteSentence(st);
            studyNext();
         } catch {
            showTips("删除失败");
         }
      }
   };
   onMount(studyNext);
   return (
      <Dialog
         class="px-2 pb-4 outline-none relative flex flex-col text-xl"
         title={`句子${sprint() > 0 ? `(${sprint()})` : ""}`}
         leftClick={() => (totalStats(), go("#home"))}
         tools={
            <div class="body p-2 relative flex gap-4 text-[150%] justify-between items-end">
               <BButton
                  onClick={() => handleIKnown(true).then(studyNext)}
                  title="X/N"
                  class="icon--material-symbols icon--material-symbols--check-circle text-green-500"
                  disabled={!isPhaseAnswer()}
               />
               <BButton
                  onClick={() => handleIKnown().then(studyNext)}
                  title="Z/M"
                  class="icon--mdi icon--mdi--cross-circle text-fuchsia-500"
                  disabled={!isPhaseAnswer()}
               />
               <BButton
                  onClick={handleDelete}
                  class="icon--material-symbols icon--material-symbols--delete-outline text-orange-500"
                  disabled={!isPhaseAnswer()}
               />
               <BButton
                  onClick={() => speak(sentence()?.sentence)}
                  class="icon--material-symbols icon--material-symbols--volume-up text-blue-500"
               />
               <div class="text-lg">{sentence()?.level}</div>
            </div>
         }
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
