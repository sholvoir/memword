// deno-lint-ignore-file no-explicit-any
/** biome-ignore-all lint/suspicious/noExplicitAny: <No> */

import { STATUS_CODE } from "@sholvoir/generic/http";
import { wait } from "@sholvoir/generic/wait";
import { type IBook, splitID } from "@sholvoir/memword-common/ibook";
import SButton from "@sholvoir/solid-components/button-base";
import BButton from "@sholvoir/solid-components/button-base";
import Tab from "@sholvoir/solid-components/tab";
import type { DivTargeted } from "@sholvoir/solid-components/targeted";
import { createResource, createSignal, For, Show } from "solid-js";
import { item2task } from "../lib/iitem.ts";
import * as idb from "../lib/indexdb.ts";
import * as mem from "../lib/mem.ts";
import * as srv from "../lib/server.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";
import Scard from "./scard.tsx";

export default () => {
   const finish = async () => {
      app.go(app.sprint() < 0 ? "#search" : undefined);
      await app.totalStats();
      //await mem.syncTasks();
      app.totalStats();
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
      if (app.citem())
         srv.putTask(item2task(await idb.studied(app.citem()!.word, level)));
   };
   const studyNext = async () => {
      if (app.sprint() < 0) return finish();
      app.setSprint((s) => s + 1);
      app.setCItem(undefined);
      app.setPhaseAnswer(false);
      setShowTrans(false);
      const item = await mem.getEpisode(app.bid());
      if (!item) return finish();
      app.setCItem(item);
      setCIndex(0);
   };
   const handleRefresh = async () => {
      app.showTips("Get Server Data...", false);
      const item = await mem.updateDict(app.citem()!);
      app.hideTips();
      app.setCItem({ ...item });
   };
   const handleReportIssue = async () => {
      app.showTips("Submiting...", false);
      await mem.submitIssue(app.citem()!.word);
      app.showTips("Submit Success!");
   };
   const handleDelete = async () => {
      app.showTips(
         (await mem.deleteItem(app.citem()!.word)) ? "删除成功" : "删除失败",
      );
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
            if (app.isPhaseAnswer()) handleIKnown().then(studyNext);
            break;
         case "M":
         case "Z":
         case "m":
         case "z":
            if (app.isPhaseAnswer()) handleIKnown(0).then(studyNext);
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
      if (!app.isPhaseAnswer()) return;
      const div = e.currentTarget;
      touchPos.endY = touchPos.startY = e.touches[0].clientY;
      touchPos.offset = 0;
      touchPos.canDown = e.currentTarget.scrollTop <= 3;
      touchPos.canUp = div.scrollHeight - div.clientHeight - div.scrollTop <= 3;
   };
   const handleTouchMove = (e: TouchEvent & DivTargeted) => {
      if (!app.isPhaseAnswer()) return;
      touchPos.endY = e.touches[0].clientY;
      const diff = touchPos.endY - touchPos.startY;
      if ((diff < 0 && touchPos.canUp) || (diff > 0 && touchPos.canDown)) {
         e.currentTarget.style.top = `${(touchPos.offset = diff)}px`;
         e.stopPropagation();
         e.preventDefault();
      }
   };
   const handleTouchCancel = (e: TouchEvent & DivTargeted) => {
      if (!app.isPhaseAnswer()) return;
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
      const cardsN = app.citem()?.entries?.length ?? 0;
      //if (cardsN === 0) return;
      if (!app.isPhaseAnswer()) {
         app.setPhaseAnswer(true);
         player.play();
      } else if (cardsN === 1) player.play();
      else if (cindex() < cardsN - 1) setCIndex((c) => c + 1);
      else setCIndex(0);
   };
   const handleAddToBook = async (book: IBook) => {
      setShowAddToBookMenu(false);
      const word = app.citem()!.word;
      const wordSet = (await mem.getBook(book.bid))?.content as Set<string>;
      if (wordSet?.has(word)) return app.showTips("已包含");
      const [_, bookName] = splitID(book.bid);
      const [status] = await mem.uploadBook(bookName, word);
      app.showTips(status === STATUS_CODE.OK ? "添加成功" : "添加失败");
      wordSet?.add(word);
      app.vocabulary().add(word);
   };
   createResource(async () => {
      setMyBooks(
         await idb.getBooks((book) => splitID(book.bid)[0] === app.user()),
      );
   });
   return (
      <Dialog
         left={
            <BButton
               class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
               onClick={finish}
            />
         }
         onKeyUp={handleKeyPress}
         tabIndex={-1}
         class="flex flex-col p-2 outline-none"
         title={`学习${app.sprint() > 0 ? `(${app.sprint()})` : ""}`}
      >
         <Show when={app.citem()}>
            <div class="relative flex gap-4 text-[150%] justify-between items-end">
               <SButton
                  onClick={() => handleIKnown().then(studyNext)}
                  title="X/N"
                  class="icon--material-symbols icon--material-symbols--check-circle text-green-500"
                  disabled={!app.isPhaseAnswer()}
               />
               <SButton
                  onClick={() => handleIKnown(0).then(studyNext)}
                  title="Z/M"
                  class="icon--mdi icon--mdi--cross-circle text-fuchsia-500"
                  disabled={!app.isPhaseAnswer()}
               />
               <SButton
                  onClick={() => handleIKnown(13).then(studyNext)}
                  class="icon--material-symbols icon--material-symbols--family-star text-yellow-500"
                  disabled={!app.isPhaseAnswer()}
               />
               <SButton
                  onClick={handleDelete}
                  class="icon--material-symbols icon--material-symbols--delete-outline text-orange-500"
                  disabled={!app.isPhaseAnswer()}
               />
               <SButton
                  onClick={() => player.play()}
                  class="icon--material-symbols icon--material-symbols--volume-up text-blue-500"
               />
               <SButton
                  onClick={handleReportIssue}
                  class="icon--material-symbols icon--material-symbols--error text-red-500"
                  disabled={!app.isPhaseAnswer()}
               />
               <SButton
                  onClick={handleRefresh}
                  class="icon--material-symbols icon--material-symbols--refresh text-purple-500"
                  disabled={!app.isPhaseAnswer()}
               />
               <Show when={!mem.setting.trans}>
                  <SButton
                     onClick={() => setShowTrans((s) => !s)}
                     class="icon--icon-park-outline icon--icon-park-outline--chinese text-amber-500"
                     disabled={!app.isPhaseAnswer()}
                  ></SButton>
               </Show>
               <SButton
                  onClick={() => setShowAddToBookMenu((s) => !s)}
                  class="icon--material-symbols icon--material-symbols--dictionary text-cyan-500"
                  disabled={!app.isPhaseAnswer()}
               ></SButton>
               <div class="text-lg">{app.citem()?.level}</div>
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
                  <div class="text-4xl font-bold">{app.citem()?.word}</div>
                  {app.isPhaseAnswer() && (
                     <div class="text-2xl flex items-center">
                        {app.citem()?.entries?.[cindex()].phonetic}
                     </div>
                  )}
               </div>
               <Show when={app.isPhaseAnswer()}>
                  <Show
                     when={(app.citem()?.entries?.length ?? 0) > 1}
                     fallback={
                        <div class="grow">
                           <Scard
                              entry={app.citem()?.entries?.[0]!}
                              trans={
                                 isShowTrans() ||
                                 app.sprint() < 0 ||
                                 mem.setting.trans
                              }
                           />
                        </div>
                     }
                  >
                     <Tab class="bg-(--bg-tab)" cindex={[cindex, setCIndex]}>
                        <For each={app.citem()?.entries}>
                           {(card) => (
                              <div class="grow">
                                 <Scard
                                    entry={card}
                                    trans={
                                       isShowTrans() ||
                                       app.sprint() < 0 ||
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
                  src={app.citem()?.entries?.at(cindex())?.sound ?? ""}
               />
            </div>
         </Show>
      </Dialog>
   );
};
