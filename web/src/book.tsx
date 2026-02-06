import { STATUS_CODE } from "@sholvoir/generic/http";
import { splitID } from "@sholvoir/memword-common/ibook";
import Button from "@sholvoir/solid-components/button-ripple";
import Checkbox from "@sholvoir/solid-components/checkbox";
import SInput from "@sholvoir/solid-components/input-simple";
import TaInput from "@sholvoir/solid-components/input-textarea";
import { createEffect, createSignal } from "solid-js";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";

export default () => {
   const [bname, setBName] = createSignal("");
   const [disc, setDisc] = createSignal("");
   const [words, setWords] = createSignal("");
   const [replace, setReplace] = createSignal(false);
   const [revision, setRevision] = createSignal("");
   const handleDownloadClick = async () => {
      const bid = `${app.user()}/${bname()}`;
      const book = await mem.getBook(bid);
      if (!book?.content) return;
      setWords(Array.from(book.content).sort().join("\n"));
   };
   const handleOKClick = async () => {
      setBName((bn) => bn.replaceAll("/", "-"));
      try {
         const [status, result] = await mem.uploadBook(
            bname(),
            words(),
            disc(),
            replace(),
         );
         switch (status) {
            case STATUS_CODE.BadRequest:
               return app.showTips("Error: 无名称或无内容");
            case STATUS_CODE.NotAcceptable:
               setRevision(
                  Object.entries(result as Record<string, string[]>)
                     .map(([key, value]) => `${key}: ${value.join(",")}`)
                     .join("\n"),
               );
               return app.showTips("未通过拼写检查");
            case STATUS_CODE.OK: {
               app.showTips("词书上传成功");
               app.go("#setting");
            }
         }
      } catch {
         app.showTips("网络错误");
      }
   };
   createEffect(() => {
      if (app.book()) {
         setBName(splitID(app.book()!.bid)[1]);
         if (app.book()!.disc) setDisc(app.book()!.disc!);
      }
   }, []);
   return (
      <Dialog class="flex flex-col p-2" title="上传我的词书">
         <label for="name">名称</label>
         <SInput name="name" binding={[bname, setBName]} />
         <label for="disc" class="mt-2">
            描述
         </label>
         <SInput name="disc" binding={[disc, setDisc]} />
         <label for="words" class="mt-2">
            词表
         </label>
         <TaInput name="words" class="grow" binding={[words, setWords]} />
         {revision().length ? (
            <>
               <label for="replace" class="text-(--accent-color) mt-2">
                  请考虑用下面的词替换
               </label>
               <textarea
                  name="replace"
                  class="grow"
                  value={revision()}
                  onChange={(e) => setRevision(e.currentTarget.value)}
               />
            </>
         ) : undefined}
         <div class="flex gap-2 my-2">
            <Checkbox binding={[replace, setReplace]} label="Replace" />
            <div class="grow"></div>
            <Button
               class="w-24 button btn-normal"
               onClick={() => app.go("#setting")}
            >
               取消
            </Button>
            <Button
               class="w-24 button btn-normal"
               onClick={handleDownloadClick}
            >
               下载
            </Button>
            <Button class="w-24 button btn-prime" onClick={handleOKClick}>
               上传
            </Button>
         </div>
      </Dialog>
   );
};
