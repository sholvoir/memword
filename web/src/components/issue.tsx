import Button from "@sholvoir/solid-components/button-ripple";
import TAInput from "@sholvoir/solid-components/input-textarea";
import { createSignal } from "solid-js";
import { submitIssue } from "../lib/mem.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";

export default () => {
   const [issue, setIssue] = createSignal("");
   const handleSubmitClick = async () => {
      await submitIssue(issue());
      app.showTips("提交成功!");
      app.go();
   };
   return (
      <Dialog class="p-2 flex flex-col" title="提交问题">
         <label for="issue">请在这里描述你的问题:</label>
         <TAInput name="issue" class="grow" binding={[issue, setIssue]}>
            {issue()}
         </TAInput>
         <div class="flex gap-2 mt-2 pb-3 justify-end">
            <Button class="w-24 button btn-normal" onClick={() => app.go()}>
               取消
            </Button>
            <Button class="w-24 button btn-prime" onClick={handleSubmitClick}>
               提交
            </Button>
         </div>
      </Dialog>
   );
};
