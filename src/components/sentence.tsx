import BButton from "@sholvoir/solid-components/button-base";
import { createSignal, onMount, Show } from "solid-js";
import { item2task } from "../lib/iitem.ts";
import {
   type IStItem,
   ST_MAX_LEVEL,
   sentenceToWords,
   studySti,
} from "../lib/ist-item.ts";
import { toTrace } from "../lib/itrace.ts";
import * as mem from "../lib/mem.ts";
import { speak } from "../lib/speech.ts";
import Dialog from "./dialog-e.tsx";
import { go, showTips } from "./provider-g.ts";
import { lemma, totalStats, vocabulary } from "./provider-user.ts";

export default () => {
   const [st, setSt] = createSignal<IStItem>();
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [sprint, setSprint] = createSignal(0);

   const studyNext = async () => {
      const st = await mem.getStEpisode();
      if (!st) {
         showTips("No More Sentence!");
         setSt();
         setPhaseAnswer(false);
      } else {
         setSt(st);
         setSprint((s) => s + 1);
         setPhaseAnswer(false);
         speak(st.sentence);
      }
   };
   const handleIKnown = async (know?: boolean) => {
      if (st()) {
         const cst = studySti(st()!, know);
         if (cst.level === ST_MAX_LEVEL) {
            await mem.deleteLocalSt(cst.sentence);
            mem.deleteSt([cst.id!]);
         } else {
            await mem.setLocalSt(cst);
            mem.uploadTracesToSts([toTrace(cst)]);
         }
         if (know) {
            const items = [];
            const result = sentenceToWords(vocabulary(), lemma(), cst.sentence);
            if (result.words)
               for (const word of result.words) {
                  items.push(await mem.studyWord(word));
               }
            if (items.length) mem.uploadTasks(items.map(item2task));
         }
      }
   };
   const handleClick = () => {
      if (!isPhaseAnswer()) setPhaseAnswer(true);
      speak(st()?.sentence);
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
      if (st()) {
         try {
            await mem.deleteLocalSt(st()!.sentence);
            showTips("删除成功");
            mem.deleteSt([st()!.id!]);
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
                  onClick={() => speak(st()?.sentence)}
                  class="icon--material-symbols icon--material-symbols--volume-up text-blue-500"
               />
               <div class="text-lg">{st()?.level}</div>
            </div>
         }
         onClick={handleClick}
         onKeyup={handleKeyPress}
         touchEnabled={isPhaseAnswer()}
         beforeAnimation={handleIKnown}
         afterAnimation={studyNext}
      >
         <Show when={st()}>
            <div>{st()!.sentence}</div>
            <Show when={isPhaseAnswer()}>
               <div class="grow">{st()!.trans}</div>
            </Show>
         </Show>
      </Dialog>
   );
};
