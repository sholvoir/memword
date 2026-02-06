import { now } from "@sholvoir/memword-common/common";
import { compareWL, type IBook } from "@sholvoir/memword-common/ibook";
import { settingFormat } from "@sholvoir/memword-common/isetting";
import Button from "@sholvoir/solid-components/button-ripple";
import Checkbox from "@sholvoir/solid-components/checkbox";
import Input from "@sholvoir/solid-components/input-simple";
import List from "@sholvoir/solid-components/list";
import { createResource, createSignal } from "solid-js";
import * as idb from "../lib/indexdb.ts";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";

export default () => {
   const [showTrans, setShowTrans] = createSignal(mem.setting.trans || false);
   const [myBooks, setMyBooks] = createSignal<Array<IBook>>([]);
   const [myIndex, setMyIndex] = createSignal(0);
   const [subBooks, setSubBooks] = createSignal<Array<IBook>>([]);
   const [subIndex, setSubIndex] = createSignal(0);
   const [books, setBooks] = createSignal<Array<IBook>>([]);
   const [cindex, setCIndex] = createSignal(0);
   const [bookFilter, setBookFilter] = createSignal("^common");

   const handleNewBookClick = () => {
      app.setBook(undefined);
      app.go("#book");
   };
   const handleUpdateBookClick = () => {
      app.setBook(myBooks()[myIndex()]);
      app.go("#book");
   };
   const handleDeleteBookClick = async () => {
      const success = await mem.deleteBook(myBooks()[myIndex()].bid);
      app.showTips(success ? "删除成功" : "删除失败");
      if (success) setMyBooks(myBooks().filter((_, i) => i !== myIndex()));
   };
   const handleAddSubClick = () => {
      setSubBooks([...subBooks(), books()[cindex()]]);
   };
   const handleDeleteSubClick = () => {
      setSubBooks([
         ...subBooks().slice(0, subIndex()),
         ...subBooks().slice(subIndex() + 1),
      ]);
   };
   const handleAddTaskClick = async () => {
      app.setShowLoading(true);
      await mem.addTasks(subBooks()[subIndex()].bid);
      await app.totalStats();
      app.setShowLoading(false);
   };
   const handleOKClick = async () => {
      await mem.syncSetting({
         format: settingFormat,
         version: now(),
         trans: showTrans(),
         books: subBooks().map((wl) => wl.bid),
      });
      await app.totalStats();
      app.go();
   };
   const handleSignoutClick = () => {
      app.setUser("");
      app.go("#about");
      idb.clear();
   };
   const toggleShrink = (
      e: MouseEvent & {
         currentTarget: HTMLLegendElement;
         target: Element;
      },
   ) => {
      const p = e.currentTarget.parentElement!;
      if (p.classList.contains("shrink-0")) p.classList.remove("shrink-0");
      else p.classList.add("shrink-0");
   };
   createResource(bookFilter, async (filter) => {
      const regex = new RegExp(filter);
      setBooks(
         (
            await idb.getBooks(
               (wl) => regex.test(wl.bid) || (wl.disc && regex.test(wl.disc)),
            )
         ).sort(compareWL),
      );
   });
   createResource(async () => {
      setBooks(
         (await idb.getBooks((wl) => wl.bid.startsWith("common"))).sort(
            compareWL,
         ),
      );
      setSubBooks(
         await idb.getBooks((wl) => mem.setting.books.includes(wl.bid)),
      );
      setMyBooks(await idb.getBooks((wl) => wl.bid.startsWith(app.user())));
   });
   return (
      <Dialog class="p-2 gap-2 flex flex-col" title="设置">
         <Checkbox
            binding={[showTrans, setShowTrans]}
            label="Always Show Trans"
         />
         <fieldset class="border rounded grow overflow-y-auto px-2">
            <legend on:click={toggleShrink}>我的词书</legend>
            <List
               cindex={[myIndex, setMyIndex]}
               options={myBooks()}
               func={(book) => book.disc ?? book.bid}
               class="px-2"
               activeClass="bg-[var(--bg-title)]"
            />
         </fieldset>
         <div class="flex justify-between gap-2">
            <Button
               class="button btn-normal grow"
               name="new"
               onClick={handleNewBookClick}
            >
               新建
            </Button>
            <Button
               class="button btn-normal grow"
               name="delete"
               disabled={!myBooks().length}
               onClick={handleDeleteBookClick}
            >
               删除
            </Button>
            <Button
               class="button btn-normal grow"
               name="update"
               disabled={!myBooks().length}
               onClick={handleUpdateBookClick}
            >
               更新
            </Button>
         </div>
         <div class="flex gap-2">
            <label for="filter">设置过滤</label>
            <Input
               class="grow"
               name="filter"
               binding={[bookFilter, setBookFilter]}
            />
         </div>
         <fieldset class="border rounded grow overflow-y-auto px-2">
            <legend on:click={toggleShrink}>可用的词书</legend>
            <List
               class="px-2"
               cindex={[cindex, setCIndex]}
               options={books()}
               func={(book) => book.disc ?? book.bid}
               activeClass="bg-[var(--bg-title)]"
            />
         </fieldset>
         <div class="flex justify-between gap-2">
            <Button class="button btn-normal grow" onClick={handleAddSubClick}>
               添加订阅
            </Button>
            <Button
               class="button btn-normal grow"
               onClick={handleDeleteSubClick}
            >
               删除订阅
            </Button>
         </div>
         <fieldset class="border rounded grow overflow-y-auto px-2">
            <legend on:click={toggleShrink}>我订阅的词书</legend>
            <List
               class="px-2"
               cindex={[subIndex, setSubIndex]}
               options={subBooks()}
               func={(book) => book.disc ?? book.bid}
               activeClass="bg-[var(--bg-title)]"
            />
         </fieldset>
         <div class="pb-3 flex justify-between gap-2">
            <Button class="button btn-normal grow" onClick={handleAddTaskClick}>
               添加任务
            </Button>
            <Button class="button btn-normal grow" onClick={handleSignoutClick}>
               登出
            </Button>
            <Button class="button btn-prime grow" onClick={handleOKClick}>
               保存
            </Button>
            <Button class="button btn-normal grow" onClick={() => app.go()}>
               取消
            </Button>
         </div>
      </Dialog>
   );
};
