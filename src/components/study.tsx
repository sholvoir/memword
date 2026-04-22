import { STATUS_CODE } from "@sholvoir/generic/http";
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
import { type IBook, splitID } from "../lib/ibook.ts";
import { type IItem, item2task, TASK_MAX_LEVEL } from "../lib/iitem.ts";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog-e.tsx";
import { useG } from "./g-provider.tsx";
import Scard from "./scard.tsx";

export default (props: {
   bid: Accessor<string | undefined>;
   citem: Accessor<IItem | undefined>;
   isPhaseAnswer: Accessor<boolean>;
   setCItem: Setter<IItem | undefined>;
   setPhaseAnswer: Setter<boolean>;
   setSprint: Setter<number>;
   sprint: Accessor<number>;
   totalStats: () => void;
   vocabulary: Accessor<Set<string>>;
}) => {
   const entries = () => props.citem()?.entries ?? [];
   const { go, showTips } = useG()!;
   const finish = () => {
      go(props.sprint() < 0 ? "#trans" : undefined);
      props.totalStats();
   };
   const [isShowTrans, setShowTrans] = createSignal(false);
   const [cindex, setCIndex] = createSignal(0);

   const [myBooks, setMyBooks] = createSignal<Array<IBook>>([]);
   const [isShowAddToBookMenu, setShowAddToBookMenu] = createSignal(false);
   let player!: HTMLAudioElement;
   const handleIKnown = async (level?: number) => {
      if (props.citem())
         mem.uploadTasks([
            item2task(await mem.studyWord(props.citem()!.word, level)),
         ]);
   };
   const studyNext = async () => {
      if (props.sprint() < 0) return finish();
      props.setSprint((s) => s + 1);
      props.setCItem(undefined);
      props.setPhaseAnswer(false);
      setShowTrans(false);
      const item = await mem.getEpisode(props.bid());
      if (!item) return finish();
      props.setCItem(item);
      setCIndex(0);
   };
   const handleRefresh = async () => {
      showTips("Get Server Data...", false);
      const item = await mem.updateDict(props.citem()!);
      showTips();
      props.setCItem({ ...item });
   };
   const handleReportIssue = async () => {
      await mem.submitIssue(props.citem()!.word, "1");
      showTips("Submitted");
   };
   const handleDelete = async () => {
      showTips(
         (await mem.deleteItem(props.citem()!.word)) ? "删除成功" : "删除失败",
      );
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
            if (props.isPhaseAnswer()) handleIKnown().then(studyNext);
            break;
         case "M":
         case "Z":
         case "m":
         case "z":
            if (props.isPhaseAnswer()) handleIKnown(0).then(studyNext);
            break;
      }
   };

   const handleClick = (e?: MouseEvent & DivTargeted) => {
      e?.stopPropagation();
      if (isShowAddToBookMenu()) return setShowAddToBookMenu(false);
      const cardsN = props.citem()?.entries?.length ?? 0;
      //if (cardsN === 0) return;
      if (!props.isPhaseAnswer()) {
         props.setPhaseAnswer(true);
         player.play();
      } else if (cardsN === 1) player.play();
      else if (cindex() < cardsN - 1) setCIndex((c) => c + 1);
      else setCIndex(0);
   };
   const handleAddToBook = async (book: IBook) => {
      setShowAddToBookMenu(false);
      const word = props.citem()!.word;
      const wordSet = (await mem.getBook(book.bid))?.content as Set<string>;
      if (wordSet?.has(word)) return showTips("已包含");
      const [_, bookName] = splitID(book.bid);
      const [status] = await mem.uploadBook(bookName, word);
      showTips(status === STATUS_CODE.OK ? "添加成功" : "添加失败");
      wordSet?.add(word);
      props.vocabulary().add(word);
   };
   createResource(async () => {
      setMyBooks(
         await mem.getLocalBooks((book) => splitID(book.bid)[0] === mem.user),
      );
   });
   return (
      <Dialog
         afterAnimation={studyNext}
         beforeAnimation={(up) => handleIKnown(up ? undefined : 0)}
         class="flex flex-col px-2 pt-2 pb-4 outline-none overflow-y-auto"
         leftClick={finish}
         onClick={handleClick}
         onKeyup={handleKeyPress}
         title={`学习${props.sprint() > 0 ? `(${props.sprint()})` : ""}`}
         tools={
            <div class="body px-2 relative flex gap-4 text-[150%] justify-between items-end">
               <BButton
                  onClick={() => handleIKnown().then(studyNext)}
                  title="X/N"
                  class="icon--material-symbols icon--material-symbols--check-circle text-green-500"
                  disabled={!props.isPhaseAnswer()}
               />
               <BButton
                  onClick={() => handleIKnown(0).then(studyNext)}
                  title="Z/M"
                  class="icon--mdi icon--mdi--cross-circle text-fuchsia-500"
                  disabled={!props.isPhaseAnswer()}
               />
               <BButton
                  onClick={() =>
                     handleIKnown(TASK_MAX_LEVEL - 1).then(studyNext)
                  }
                  class="icon--material-symbols icon--material-symbols--family-star text-yellow-500"
                  disabled={!props.isPhaseAnswer()}
               />
               <BButton
                  onClick={handleDelete}
                  class="icon--material-symbols icon--material-symbols--delete-outline text-orange-500"
                  disabled={!props.isPhaseAnswer()}
               />
               <BButton
                  onClick={() => player.play()}
                  class="icon--material-symbols icon--material-symbols--volume-up text-blue-500"
               />
               <BButton
                  onClick={handleReportIssue}
                  class="icon--material-symbols icon--material-symbols--error text-red-500"
                  disabled={!props.isPhaseAnswer()}
               />
               <BButton
                  onClick={handleRefresh}
                  class="icon--material-symbols icon--material-symbols--refresh text-purple-500"
                  disabled={!props.isPhaseAnswer()}
               />
               <Show when={!mem.setting.trans}>
                  <BButton
                     onClick={() => setShowTrans((s) => !s)}
                     class="icon--icon-park-outline icon--icon-park-outline--chinese text-amber-500"
                     disabled={!props.isPhaseAnswer()}
                  ></BButton>
               </Show>
               <BButton
                  onClick={() => setShowAddToBookMenu((s) => !s)}
                  class="icon--material-symbols icon--material-symbols--dictionary text-cyan-500"
                  disabled={!props.isPhaseAnswer()}
               ></BButton>
               <div class="text-lg">{props.citem()?.level}</div>
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
         }
         touchEnabled={props.isPhaseAnswer()}
      >
         <Show when={props.citem()}>
            <div class="py-2 flex gap-2 flex-wrap justify-between">
               <div class="text-4xl font-bold">{props.citem()?.word}</div>
               {props.isPhaseAnswer() && (
                  <div class="text-2xl flex items-center">
                     {props.citem()?.entries?.[cindex()].phonetic}
                  </div>
               )}
            </div>
            <Show when={props.isPhaseAnswer()}>
               <Show
                  when={entries().length > 1}
                  fallback={
                     <Scard
                        meanings={entries()[0]?.meanings}
                        showTrans={
                           isShowTrans() ||
                           props.sprint() < 0 ||
                           mem.setting.trans
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
                                 props.sprint() < 0 ||
                                 mem.setting.trans
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
               src={props.citem()?.entries?.at(cindex())?.sound ?? ""}
            />
         </Show>
      </Dialog>
   );
};
