import { STATUS_CODE } from "@sholvoir/generic/http";
import { wait } from "@sholvoir/generic/wait";
import SButton from "@sholvoir/solid-components/button-base";
import BButton from "@sholvoir/solid-components/button-base";
import Tab from "@sholvoir/solid-components/tab";
import type { DivTargeted } from "@sholvoir/solid-components/targeted";
import {
   type Accessor,
   createResource,
   createSignal,
   For,
   type Setter,
   Show,
} from "solid-js";
import type { TDial } from "src/lib/idial.ts";
import type { IStats } from "src/lib/istat.ts";
import { type IBook, splitID } from "#srv/lib/ibook.ts";
import { type IItem, item2task } from "../lib/iitem.ts";
import * as idb from "../lib/indexdb.ts";
import * as mem from "../lib/mem.ts";
import * as srv from "../lib/server.ts";
import Dialog from "./dialog.tsx";
import Scard from "./scard.tsx";

export default ({
   bid,
   citem,
   go,
   hideTips,
   isPhaseAnswer,
   setCItem,
   setPhaseAnswer,
   setSprint,
   showTips,
   sprint,
   tips,
   totalStats,
   user,
   vocabulary,
}: {
   bid: Accessor<string | undefined>;
   citem: Accessor<IItem | undefined>;
   go: (d?: TDial) => void;
   hideTips: () => void;
   isPhaseAnswer: Accessor<boolean>;
   setCItem: Setter<IItem | undefined>;
   setPhaseAnswer: Setter<boolean>;
   setSprint: Setter<number>;
   showTips: (content: string, autohide?: boolean) => void;
   sprint: Accessor<number>;
   tips: Accessor<string>;
   totalStats: () => Promise<IStats>;
   user: Accessor<string>;
   vocabulary: Accessor<Set<string>>;
}) => {
   const finish = async () => {
      go(sprint() < 0 ? "#search" : undefined);
      await totalStats();
      //await mem.syncTasks();
      totalStats();
   };
   const [isShowTrans, setShowTrans] = createSignal(false);
   const [cindex, setCIndex] = createSignal(0);
   const touchPos = {
      startY: 0,
      endY: 0,
      offset: 0,
      canUp: false,
      canDown: false,
   };

   const [myBooks, setMyBooks] = createSignal<Array<IBook>>([]);
   const [isShowAddToBookMenu, setShowAddToBookMenu] = createSignal(false);
   let player!: HTMLAudioElement;
   const handleIKnown = async (level?: number) => {
      if (citem())
         srv.putTask(item2task(await idb.studied(citem()!.word, level)));
   };
   const studyNext = async () => {
      if (sprint() < 0) return finish();
      setSprint((s) => s + 1);
      setCItem(undefined);
      setPhaseAnswer(false);
      setShowTrans(false);
      const item = await mem.getEpisode(bid());
      if (!item) return finish();
      setCItem(item);
      setCIndex(0);
   };
   const handleRefresh = async () => {
      showTips("Get Server Data...", false);
      const item = await mem.updateDict(citem()!);
      hideTips();
      setCItem({ ...item });
   };
   const handleReportIssue = async () => {
      showTips("Submiting...", false);
      await mem.submitIssue(citem()!.word);
      hideTips();
   };
   const handleDelete = async () => {
      showTips((await mem.deleteItem(citem()!.word)) ? "删除成功" : "删除失败");
      await studyNext();
   };
   const handleKeyPress = (e: KeyboardEvent & DivTargeted) => {
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
   const continueMove = async (div: HTMLDivElement, x: number) => {
      div.style.top = `${(touchPos.offset += x)}px`;
      if (Math.abs(touchPos.offset) < globalThis.innerHeight) {
         await wait(30);
         await continueMove(div, x);
      }
   };
   const handleTouchStart = (e: TouchEvent & DivTargeted) => {
      if (!isPhaseAnswer()) return;
      const div = e.currentTarget;
      touchPos.endY = touchPos.startY = e.touches[0].clientY;
      touchPos.offset = 0;
      touchPos.canDown = e.currentTarget.scrollTop <= 3;
      touchPos.canUp = div.scrollHeight - div.clientHeight - div.scrollTop <= 3;
   };
   const handleTouchMove = (e: TouchEvent & DivTargeted) => {
      if (!isPhaseAnswer()) return;
      touchPos.endY = e.touches[0].clientY;
      const diff = touchPos.endY - touchPos.startY;
      if ((diff < 0 && touchPos.canUp) || (diff > 0 && touchPos.canDown)) {
         e.currentTarget.style.top = `${(touchPos.offset = diff)}px`;
         e.stopPropagation();
         e.preventDefault();
      }
   };
   const handleTouchCancel = (e: TouchEvent & DivTargeted) => {
      if (!isPhaseAnswer()) return;
      e.currentTarget.style.top = `${(touchPos.offset = 0)}`;
   };
   const handleTouchEnd = async (e: TouchEvent & DivTargeted) => {
      const div = e.currentTarget;
      if (Math.abs(touchPos.offset) >= globalThis.innerHeight / 6) {
         const down = touchPos.offset > 0;
         await handleIKnown(down ? 0 : undefined);
         await continueMove(div, down ? 60 : -60);
         await studyNext();
      }
      div.style.top = `${(touchPos.offset = 0)}`;
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
   createResource(async () => {
      setMyBooks(await idb.getBooks((book) => splitID(book.bid)[0] === user()));
   });
   return (
      <Dialog
         class="flex flex-col p-2 outline-none"
         left={
            <BButton
               class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
               onClick={finish}
            />
         }
         onKeyUp={handleKeyPress}
         tabIndex={-1}
         tips={tips}
         title={`学习${sprint() > 0 ? `(${sprint()})` : ""}`}
      >
         <Show when={citem()}>
            <div class="relative flex gap-4 text-[150%] justify-between items-end">
               <SButton
                  onClick={() => handleIKnown().then(studyNext)}
                  title="X/N"
                  class="icon--material-symbols icon--material-symbols--check-circle text-green-500"
                  disabled={!isPhaseAnswer()}
               />
               <SButton
                  onClick={() => handleIKnown(0).then(studyNext)}
                  title="Z/M"
                  class="icon--mdi icon--mdi--cross-circle text-fuchsia-500"
                  disabled={!isPhaseAnswer()}
               />
               <SButton
                  onClick={() => handleIKnown(13).then(studyNext)}
                  class="icon--material-symbols icon--material-symbols--family-star text-yellow-500"
                  disabled={!isPhaseAnswer()}
               />
               <SButton
                  onClick={handleDelete}
                  class="icon--material-symbols icon--material-symbols--delete-outline text-orange-500"
                  disabled={!isPhaseAnswer()}
               />
               <SButton
                  onClick={() => player.play()}
                  class="icon--material-symbols icon--material-symbols--volume-up text-blue-500"
               />
               <SButton
                  onClick={handleReportIssue}
                  class="icon--material-symbols icon--material-symbols--error text-red-500"
                  disabled={!isPhaseAnswer()}
               />
               <SButton
                  onClick={handleRefresh}
                  class="icon--material-symbols icon--material-symbols--refresh text-purple-500"
                  disabled={!isPhaseAnswer()}
               />
               <Show when={!mem.setting.trans}>
                  <SButton
                     onClick={() => setShowTrans((s) => !s)}
                     class="icon--icon-park-outline icon--icon-park-outline--chinese text-amber-500"
                     disabled={!isPhaseAnswer()}
                  ></SButton>
               </Show>
               <SButton
                  onClick={() => setShowAddToBookMenu((s) => !s)}
                  class="icon--material-symbols icon--material-symbols--dictionary text-cyan-500"
                  disabled={!isPhaseAnswer()}
               ></SButton>
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
                     {myBooks().length && <div />}
                  </div>
               </Show>
            </div>
            <div
               class="relative grow h-0 pb-4 flex flex-col overflow-y-auto"
               on:click={handleClick}
               on:touchstart={handleTouchStart}
               on:touchmove={handleTouchMove}
               on:touchend={handleTouchEnd}
               on:touchcancel={handleTouchCancel}
            >
               <div class="py-2 flex gap-2 flex-wrap justify-between">
                  <div class="text-4xl font-bold">{citem()?.word}</div>
                  {isPhaseAnswer() && (
                     <div class="text-2xl flex items-center">
                        {citem()?.entries?.[cindex()].phonetic}
                     </div>
                  )}
               </div>
               <Show when={isPhaseAnswer()}>
                  <Show
                     when={(citem()?.entries?.length ?? 0) > 1}
                     fallback={
                        <div class="grow [&>p>tt]:text-lg [&>p>tt]:font-bold [&>p>b]:font-bold [&>p>i]:font-italic">
                           <Scard
                              entry={citem()?.entries?.[0]!}
                              trans={
                                 isShowTrans() ||
                                 sprint() < 0 ||
                                 mem.setting.trans
                              }
                           />
                        </div>
                     }
                  >
                     <Tab class="bg-(--bg-tab)" cindex={[cindex, setCIndex]}>
                        <For each={citem()?.entries}>
                           {(card) => (
                              <div class="grow [&>p>tt]:text-lg [&>p>tt]:font-bold [&>p>b]:font-bold [&>p>i]:font-italic">
                                 <Scard
                                    entry={card}
                                    trans={
                                       isShowTrans() ||
                                       sprint() < 0 ||
                                       mem.setting.trans
                                    }
                                 />
                              </div>
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
            </div>
         </Show>
      </Dialog>
   );
};
