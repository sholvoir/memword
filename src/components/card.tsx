import type { WithID } from "@sholvoir/dict-server/src/lib/common.ts";
import BButton from "@sholvoir/solid-components/button-base";
import { batch, createSignal, Index, onMount, Show } from "solid-js";
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
import { setCard as setCommonCard } from "./provider-card.ts";
import { go, showTips } from "./provider-g.ts";
import { lemma, totalStats, vocabulary } from "./provider-user.ts";

const CardLine = (props: { line: Array<string>; showAnswer: boolean }) => {
   return (
      <>
         <div
            classList={{
               "col-span-2":
                  props.line[0].length > 18 || props.line[1].length > 9,
            }}
            innerHTML={props.line[0]}
         />
         <div
            classList={{
               "col-span-2":
                  props.line[0].length > 18 || props.line[1].length > 9,
            }}
            innerHTML={props.showAnswer ? (props.line[1] ?? "") : ""}
         />
      </>
   );
};

export default () => {
   const [card, setCard] = createSignal<WithID<ICard>>();
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [sprint, setSprint] = createSignal(0);
   const show = () => card()?.page?.replaceAll("()", "").split("\n") ?? [];
   let sound = "";

   const studyNext = async () => {
      const ccard = await mem.getCardEpisode();
      if (!ccard) {
         showTips("No More Cards!");
         totalStats();
         go("#home");
      } else {
         batch(() => {
            setCard(ccard);
            setSprint((s) => s + 1);
            setPhaseAnswer(false);
         });
         if (!ccard.silence) {
            const clips = [];
            for (const line of ccard.page!.split("\n")) {
               const [o] = line.split(/\t+/);
               if (o) clips.push(o);
            }
            if (clips.length) speak((sound = clips.join(".\n")));
         }
      }
   };
   const handleIKnown = async (know?: boolean) => {
      if (card()) {
         const ccard = studyCard(card()!, know);
         if (ccard.level >= ST_MAX_LEVEL) {
            await mem.deleteLocalCard(ccard.id);
            await mem.deleteCard([ccard.id]);
         } else {
            await mem.setLocalCard(ccard);
            await mem.uploadCardTraces([extractIDTrace(ccard)]);
         }
         if (know) {
            const items = [];
            const result = extractWords(vocabulary(), lemma(), ccard.page!);
            if (result.words)
               for (const word of result.words) {
                  items.push(await mem.studyWord(word));
               }
            if (items.length) await mem.uploadTasks(items.map(toTask));
         }
      }
   };
   const handleClick = () => {
      if (!isPhaseAnswer()) setPhaseAnswer(true);
      if (!card()?.silence) speak(sound);
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
            await mem.deleteCard([card()!.id!]);
            studyNext();
         } catch {
            showTips("删除失败");
         }
      }
   };
   onMount(studyNext);
   return (
      <Dialog
         afterAnimation={studyNext}
         beforeAnimation={handleIKnown}
         class="px-2 pb-4 outline-none relative flex flex-col text-xl gap-2 overflow-y-auto"
         leftClick={() => (totalStats(), go("#home"))}
         onClick={handleClick}
         onKeyup={handleKeyPress}
         title={`闪卡${sprint() > 0 ? `(${sprint()})` : ""}`}
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
                  onClick={() => speak(sound)}
                  class="icon--material-symbols icon--material-symbols--volume-up text-blue-500"
                  disabled={card()?.silence}
               />
               <div class="text-lg">{card()?.level}</div>
               <BButton
                  disabled={!card()}
                  onClick={() => (setCommonCard(card()!), go("#trans"))}
                  class="icon--material-symbols-light icon--material-symbols-light--edit-document text-cyan-500"
               />
            </div>
         }
         touchEnabled={isPhaseAnswer()}
      >
         <Show when={card()}>
            <div class="grid grid-cols-[auto_auto] gap-2">
               <Index each={show()}>
                  {(line) => (
                     <CardLine
                        line={line().split(/\t+/)}
                        showAnswer={isPhaseAnswer()}
                     />
                  )}
               </Index>
            </div>
         </Show>
      </Dialog>
   );
};
