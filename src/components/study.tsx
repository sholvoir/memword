import { STATUS_CODE } from "@sholvoir/generic/http";
import BButton from "@sholvoir/solid-components/button-base";
import Tab from "@sholvoir/solid-components/tab";
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
import { type IItem, item2task, TASK_MAX_LEVEL } from "../lib/iitem.ts";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog-e.tsx";
import { go, showTips, user } from "./provider-g.ts";
import { bid, blevel, search, setSearch } from "./provider-study.ts";
import { setting, totalStats, vocabulary } from "./provider-user.ts";
import Scard from "./scard.tsx";

export default () => {
   const [citem, setCItem] = createSignal<IItem>();
   const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
   const [sprint, setSprint] = createSignal(-1);
   const [isShowTrans, setShowTrans] = createSignal(false);
   const [cindex, setCIndex] = createSignal(0);
   const [isShowAddToBookMenu, setShowAddToBookMenu] = createSignal(false);
   const entries = () => citem()?.entries ?? [];

   const [myBooks] = createResource(user, async (u) =>
      (await mem.getLocalBooks()).filter(
         (book) => splitID(book.bid)[0] === u.name,
      ),
   );
   let player!: HTMLAudioElement;
   const finish = () => {
      if (search()) {
         setSearch();
         go("#trans");
      } else {
         totalStats();
         go("#home");
      }
   };

   const handleIKnown = async (level?: number) => {
      if (citem())
         mem.uploadTasks([
            item2task(await mem.studyWord(citem()!.word, level)),
         ]);
   };
   const studyNext = async () => {
      if (search()) return setSearch(), go("#trans");
      batch(() => {
         setSprint((s) => s + 1);
         setCItem(undefined);
         setPhaseAnswer(false);
         setShowTrans(false);
      });
      const item = await mem.getEpisode(bid());
      if (!item) return totalStats(), go("#home");
      batch(() => {
         setCItem(item);
         setCIndex(0);
      });
   };
   const handleRefresh = async () => {
      showTips("Get Server Data...", false);
      const item = await mem.updateDict(citem()!);
      showTips();
      setCItem({ ...item });
   };
   const handleReportIssue = async () => {
      await mem.submitIssue(citem()!.word, "1");
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
      const cardsN = citem()?.entries?.length ?? 0;
      //if (cardsN === 0) return;
      if (!isPhaseAnswer()) {
         setPhaseAnswer(true);
         player.play();
      } else if (cardsN === 1) player.play();
      else if (cindex() < cardsN - 1) setCIndex((c) => c + 1);
      else setCIndex(0);
   };
   const handleAddToBook = async (book: IBook) => {
      setShowAddToBookMenu(false);
      const word = citem()!.word;
      const wordSet = (await mem.getBook(book.bid))?.content as Set<string>;
      if (wordSet?.has(word)) return showTips("已包含");
      const [_, bookName] = splitID(book.bid);
      const [status] = await mem.uploadBook(bookName, word);
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
      } else {
         const item = await mem.getEpisode(bid(), blevel());
         if (item)
            batch(() => {
               setCItem(item);
               setPhaseAnswer(false);
               setSprint(0);
            });
         else showTips("No More Task");
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
               <BButton
                  onClick={() => player.play()}
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
               <Show when={!setting().trans}>
                  <BButton
                     onClick={() => setShowTrans((s) => !s)}
                     class="icon--icon-park-outline icon--icon-park-outline--chinese text-amber-500"
                     disabled={!isPhaseAnswer()}
                  ></BButton>
               </Show>
               <BButton
                  onClick={() => setShowAddToBookMenu((s) => !s)}
                  class="icon--material-symbols icon--material-symbols--dictionary text-cyan-500"
                  disabled={!isPhaseAnswer()}
               ></BButton>
               <div class="text-lg">{citem()?.level}</div>
               <Show when={isShowAddToBookMenu()}>
                  <div class="menu absolute top-full right-[36px] text-lg text-right bg-(--bg-body) z-1">
                     <For each={myBooks()}>
                        {(wl) => (
                           <>
                              <div />
                              <menu onClick={() => handleAddToBook(wl)}>
                                 {wl.disc ?? wl.bid}
                              </menu>
                           </>
                        )}
                     </For>
                     <Show when={myBooks()?.length}>
                        <div />
                     </Show>
                  </div>
               </Show>
            </div>
         }
         touchEnabled={isPhaseAnswer()}
      >
         <Show when={citem()}>
            <div class="pb-2 flex gap-2 flex-wrap justify-between">
               <div class="text-4xl font-bold">{citem()?.word}</div>
               {isPhaseAnswer() && (
                  <div class="text-2xl flex items-center">
                     {citem()?.entries?.[cindex()].phonetic}
                  </div>
               )}
            </div>
            <Show when={isPhaseAnswer()}>
               <Show
                  when={entries().length > 1}
                  fallback={
                     <Scard
                        meanings={entries()[0]?.meanings}
                        showTrans={
                           isShowTrans() || sprint() < 0 || setting().trans
                        }
                     />
                  }
               >
                  <Tab class="bg-(--bg-tab)" cindex={[cindex, setCIndex]}>
                     <For each={entries()}>
                        {(entry) => (
                           <Scard
                              meanings={entry.meanings}
                              showTrans={
                                 isShowTrans() ||
                                 sprint() < 0 ||
                                 setting().trans
                              }
                           />
                        )}
                     </For>
                  </Tab>
               </Show>
            </Show>
            <audio
               ref={player}
               autoplay
               src={citem()?.entries?.at(cindex())?.sound ?? ""}
            />
         </Show>
      </Dialog>
   );
};
