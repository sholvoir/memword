import Button from "@sholvoir/solid-components/button-ripple";
import TAInput from "@sholvoir/solid-components/input-textarea";
import { createSignal } from "solid-js";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog.tsx";
import { useG } from "./g-provider.tsx";

export default () => {
   const [issue, setIssue] = createSignal("");
   const { go, showTips } = useG()!;
   const handleSubmitClick = async () => {
      await mem.submitIssue(issue());
      showTips("提交成功!");
      go();
   };
   return (
      <Dialog
         class="p-2 flex flex-col"
         title="提交问题"
         bottom={
            <div class="px-2 pt-2 pb-5 flex gap-2 justify-end">
               <Button class="w-24 button btn-normal" onClick={() => go()}>
                  取消
               </Button>
               <Button
                  class="w-24 button btn-prime"
                  onClick={handleSubmitClick}
               >
                  提交
               </Button>
            </div>
         }
      >
         <label for="issue">请在这里描述你的问题:</label>
         <TAInput name="issue" class="grow" binding={[issue, setIssue]}>
            {issue()}
         </TAInput>
      </Dialog>
   );
};
