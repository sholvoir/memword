import BButton from "@sholvoir/solid-components/button-base";
import { type Accessor, createResource, createSignal, Show } from "solid-js";
import type { ISentence } from "#srv/lib/isentence.ts";
import type { TDial } from "../lib/idial.ts";
import { item2task } from "../lib/iitem.ts";
import * as idb from "../lib/indexdb.ts";
import { sentenceToWords, studySentence } from "../lib/isentence.ts";
import * as srv from "../lib/server.ts";
import Dialog from "./dialog-e.tsx";

export default (props: {
   go: (d?: TDial) => void;
   showTips: (content?: string, autohide?: boolean) => void;
   tips: Accessor<string | undefined>;
   vocabulary: Set<string>;
}) => {
   const [sentence, setSentence] = createSignal<ISentence>();
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [sprint, setSprint] = createSignal(0);

   const speak = () => {
      if (sentence()) {
         const utterance = new SpeechSynthesisUtterance(sentence()!.sentence);
         speechSynthesis.speak(utterance);
      }
   };
   const studyNext = async () => {
      const st = await idb.getStEpisode();
      if (!st) props.showTips("No More Sentence!");
      else {
         setSentence(st);
         setSprint((s) => s + 1);
         speak();
      }
   };
   const handleIKnown = async (know?: boolean) => {
      if (sentence()) {
         const st = studySentence(sentence()!, know);
         await idb.putSentence(st);
         delete st.trans;
         await srv.putSentence(st);
         const items = [];
         const result = sentenceToWords(props.vocabulary, st.sentence);
         if (result.words)
            for (const word of result.words) {
               items.push(await idb.studied(word));
            }
         if (items.length) srv.postTasks(items.map(item2task));
      }
   };
   const handleClick = () => {
      if (!isPhaseAnswer()) setPhaseAnswer(true);
      speak();
   };
   createResource(studyNext);
   return (
      <Dialog
         class="h-full p-2 outline-none"
         left={
            <BButton
               class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
               onClick={() => props.go()}
            />
         }
         tips={props.tips}
         title={`句子${sprint() > 0 ? `(${sprint()})` : ""}`}
         onClick={handleClick}
         touchEnabled={isPhaseAnswer()}
      >
         <div class="relative h-full flex flex-col" on:click={handleClick}>
            <Show when={sentence()}>
               <div>{sentence()!.sentence}</div>
               <Show when={isPhaseAnswer()}>
                  <div class="grow">{sentence()!.trans}</div>
               </Show>
            </Show>
         </div>
      </Dialog>
   );
};
