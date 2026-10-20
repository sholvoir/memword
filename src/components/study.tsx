import { STATUS_CODE } from "@sholvoir/generic/http";
import BButton from "@sholvoir/solid-components/button-base";
import type { DivTargeted } from "@sholvoir/solid-components/targeted";
import {
   batch,
   createResource,
   createSignal,
   For,
   onMount,
   Show,
} from "solid-js";
import { type IBook, splitID } from "../lib/ibook.ts";
import { type IItem, TASK_MAX_LEVEL, toTask } from "../lib/iitem.ts";
import * as mem from "../lib/mem.ts";
import { speak } from "../lib/speech.ts";
import Dialog from "./dialog-e.tsx";
import Entry from "./entry.tsx";
import { go, showTips, user } from "./provider-g.ts";
import { bid, blevel, search } from "./provider-study.ts";
import { totalStats, vocabulary } from "./provider-user.ts";
import "./menu.css";

export default () => {
   const [citem, setCItem] = createSignal<IItem>();
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [sprint, setSprint] = createSignal(-1);
   const [isShowAddToBookMenu, setShowAddToBookMenu] = createSignal(false);
   const entries = () => citem()?.entries ?? [];
   const audio = { sounds: [""], index: 0 };
   const initSounds = (item: IItem) => {
      const sounds = new Set<string>();
      if (item.entries?.length)
         for (const entry of item.entries)
            if (entry.pronounces?.length)
               for (const pronounce of entry.pronounces)
                  if (pronounce.sound) sounds.add(pronounce.sound);
      audio.sounds = Array.from(sounds);
      audio.index = 0;
      playSound();
   };

   const [myBooks] = createResource(user, async (u) =>
      (await mem.getLocalBooks()).filter(
         (book) => splitID(book.bid)[0] === u.name,
      ),
   );

   let player!: HTMLAudioElement;
   const playSound = () => {
      if (audio.sounds.length) {
         player.src = audio.sounds[audio.index];
      } else speak(citem()?.word);
   };
   const continuePlay = () => {
      audio.index++;
      if (audio.index < audio.sounds.length) playSound();
      else {
         player.src = "";
         audio.index = 0;
      }
   };

   const finish = () => {
      if (search()) go("#trans");
      else {
         totalStats();
         go("#home");
      }
   };

   const handleIKnown = async (level?: number) => {
      if (citem())
         mem.uploadTasks([toTask(await mem.studyWord(citem()!.word, level))]);
   };
   const studyNext = async () => {
      if (search()) return go("#trans");
      batch(() => {
         setSprint((s) => s + 1);
         setCItem(undefined);
         setPhaseAnswer(false);
      });
      const item = await mem.getEpisode(bid(), blevel());
      if (!item) return totalStats(), go("#home");
      setCItem(item);
      initSounds(item);
   };
   const handleRefresh = async () => {
      showTips("Get Server Data...", false);
      const item = await mem.updateDict(citem()!);
      showTips();
      setCItem({ ...item });
      initSounds(item);
   };
   const handleReportIssue = async () => {
      await mem.submitDictIssue(citem()!.word);
      showTips("Submitted");
   };
   const handleDelete = async () => {
      showTips((await mem.deleteItem(citem()!.word)) ? "删除成功" : "删除失败");
      await studyNext();
   };
   const handleKeyPress = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.ctrlKey || e.altKey) return;
      switch (e.key) {
         case " ":
            handleClick(e as any);
            break;
         case "N":
         case "X":
         case "n":
         case "x":
            if (isPhaseAnswer()) handleIKnown().then(studyNext);
            break;
         case "M":
         case "Z":
         case "m":
         case "z":
            if (isPhaseAnswer()) handleIKnown(0).then(studyNext);
            break;
      }
   };

   const handleClick = (e?: MouseEvent & DivTargeted) => {
      e?.stopPropagation();
      if (isShowAddToBookMenu()) return setShowAddToBookMenu(false);
      if (!isPhaseAnswer()) setPhaseAnswer(true);
      playSound();
   };
   const handleAddToBook = async (book: IBook) => {
      setShowAddToBookMenu(false);
      const word = citem()!.word;
      const wordSet = (await mem.getBook(book.bid))?.content as Set<string>;
      if (wordSet?.has(word)) return showTips("已包含");
      const [_, bookName] = splitID(book.bid);
      const [status] = await mem.uploadBook(word, { name: bookName });
      showTips(status === STATUS_CODE.OK ? "添加成功" : "添加失败");
      wordSet?.add(word);
      vocabulary().add(word);
   };
   onMount(async () => {
      if (search()) {
         const item = await mem.search(search()!);
         if (!item) return showTips("Not Found!");
         setCItem(item);
         setPhaseAnswer(true);
         initSounds(item);
      } else {
         const item = await mem.getEpisode(bid(), blevel());
         if (item) {
            batch(() => {
               setCItem(item);
               setPhaseAnswer(false);
               setSprint(0);
            });
            initSounds(item);
         } else showTips("No More Task");
      }
   });
   return (
      <Dialog
         afterAnimation={studyNext}
         beforeAnimation={(up) => handleIKnown(up ? undefined : 0)}
         class="flex flex-col px-2 pb-4 outline-none overflow-y-auto"
         leftClick={finish}
         onClick={handleClick}
         onKeyup={handleKeyPress}
         title={`学习${sprint() > 0 ? `(${sprint()})` : ""}`}
         tools={
            <div class="body p-2 relative flex gap-4 text-[150%] justify-between items-end">
               <BButton
                  onClick={() => handleIKnown().then(studyNext)}
                  title="X/N"
                  class="icon--material-symbols icon--material-symbols--check-circle text-green-500"
                  disabled={!isPhaseAnswer()}
               />
               <BButton
                  onClick={() => handleIKnown(0).then(studyNext)}
                  title="Z/M"
                  class="icon--mdi icon--mdi--cross-circle text-fuchsia-500"
                  disabled={!isPhaseAnswer()}
               />
               <BButton
                  onClick={() =>
                     handleIKnown(TASK_MAX_LEVEL - 1).then(studyNext)
                  }
                  class="icon--material-symbols icon--material-symbols--family-star text-yellow-500"
                  disabled={!isPhaseAnswer()}
               />
               <BButton
                  onClick={handleDelete}
                  class="icon--material-symbols icon--material-symbols--delete-outline text-orange-500"
                  disabled={!isPhaseAnswer()}
               />
               <div class="text-lg w-3">{citem()?.level}</div>
               <BButton
                  onClick={playSound}
                  class="icon--material-symbols icon--material-symbols--volume-up text-blue-500"
               />
               <BButton
                  onClick={handleReportIssue}
                  class="icon--material-symbols icon--material-symbols--error text-red-500"
                  disabled={!isPhaseAnswer()}
               />
               <BButton
                  onClick={handleRefresh}
                  class="icon--material-symbols icon--material-symbols--refresh text-purple-500"
                  disabled={!isPhaseAnswer()}
               />
               <BButton
                  onClick={() => setShowAddToBookMenu((s) => !s)}
                  class="icon--material-symbols icon--material-symbols--dictionary text-cyan-500"
                  disabled={!isPhaseAnswer()}
               ></BButton>
               <Show when={isShowAddToBookMenu()}>
                  <div class="menu absolute top-full right-2 text-lg text-right bg-(--bg-body) z-1 border rounded-md">
                     <For each={myBooks()}>
                        {(wl, i) => (
                           <>
                              <BButton onClick={[handleAddToBook, wl]}>
                                 {wl.disc ?? wl.bid}
                              </BButton>
                              <Show when={i() < (myBooks()?.length ?? 0) - 1}>
                                 <div />
                              </Show>
                           </>
                        )}
                     </For>
                  </div>
               </Show>
            </div>
         }
         touchEnabled={isPhaseAnswer()}
      >
         <Show when={citem()}>
            <div class="pb-2 text-4xl font-bold">{citem()?.word}</div>
            <Show when={isPhaseAnswer() && entries().length}>
               <For each={entries()}>{(entry) => <Entry entry={entry} />}</For>
            </Show>
            <audio ref={player} autoplay onEnded={continuePlay} />
         </Show>
      </Dialog>
   );
};
