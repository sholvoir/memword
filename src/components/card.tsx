import type { WithID } from "@sholvoir/dict-server/src/lib/common.ts";
import BButton from "@sholvoir/solid-components/button-base";
import { createSignal, Index, onMount, Show } from "solid-js";
import {
   extractWords,
   type ICard,
   ST_MAX_LEVEL,
   studyCard,
} from "../lib/icard.ts";
import { toTask } from "../lib/iitem.ts";
import { extractIDTrace } from "../lib/itrace.ts";
import * as mem from "../lib/mem.ts";
import { speak } from "../lib/speech.ts";
import Dialog from "./dialog-e.tsx";
import { go, showTips } from "./provider-g.ts";
import { lemma, totalStats, vocabulary } from "./provider-user.ts";

export default () => {
   const [card, setCard] = createSignal<WithID<ICard>>();
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [sprint, setSprint] = createSignal(0);
   const [sound, setSound] = createSignal("");

   const studyNext = async () => {
      const card = await mem.getCardEpisode();
      if (!card) {
         showTips("No More Cards!");
         totalStats();
         go("#home");
      } else {
         setCard(card);
         setSprint((s) => s + 1);
         setPhaseAnswer(false);
         speak(setSound(card.page!.replaceAll(/<r>.+?<\/r>/g, "")));
      }
   };
   const handleIKnown = async (know?: boolean) => {
      if (card()) {
         const ccard = studyCard(card()!, know);
         if (ccard.level === ST_MAX_LEVEL) {
            await mem.deleteLocalCard(ccard.id);
            mem.deleteCard([ccard.id]);
         } else {
            await mem.setLocalCard(ccard);
            mem.uploadCardTraces([extractIDTrace(ccard)]);
         }
         if (know) {
            const items = [];
            const result = extractWords(vocabulary(), lemma(), ccard.page!);
            if (result.words)
               for (const word of result.words) {
                  items.push(await mem.studyWord(word));
               }
            if (items.length) mem.uploadTasks(items.map(toTask));
         }
      }
   };
   const handleClick = () => {
      if (!isPhaseAnswer()) setPhaseAnswer(true);
      speak(sound());
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
      if (card()) {
         try {
            await mem.deleteLocalCard(card()!.id!);
            showTips("删除成功");
            mem.deleteCard([card()!.id!]);
            studyNext();
         } catch {
            showTips("删除失败");
         }
      }
   };
   onMount(studyNext);
   return (
      <Dialog
         class="px-2 pb-4 outline-none relative flex flex-col text-xl gap-2"
         title={`闪卡${sprint() > 0 ? `(${sprint()})` : ""}`}
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
                  onClick={() => speak(sound())}
                  class="icon--material-symbols icon--material-symbols--volume-up text-blue-500"
               />
               <div class="text-lg">{card()?.level}</div>
            </div>
         }
         onClick={handleClick}
         onKeyup={handleKeyPress}
         touchEnabled={isPhaseAnswer()}
         beforeAnimation={handleIKnown}
         afterAnimation={studyNext}
      >
         <Show when={card()}>
            <div
               class={isPhaseAnswer() ? "[&>p>r]:font-bold" : "[&>p>r]:hidden"}
            >
               <Index each={card()!.page?.replaceAll("()", "").split("\n")}>
                  {(p) => <p innerHTML={p()} />}
               </Index>
            </div>
         </Show>
      </Dialog>
   );
};
