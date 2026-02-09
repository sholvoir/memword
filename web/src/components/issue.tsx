import Button from "@sholvoir/solid-components/button-ripple";
import TAInput from "@sholvoir/solid-components/input-textarea";
import { type Accessor, createSignal } from "solid-js";
import type { TDial } from "src/lib/idial.ts";
import { submitIssue } from "../lib/mem.ts";
import Dialog from "./dialog.tsx";

export default ({
   go,
   showTips,
   tips,
}: {
   go: (d?: TDial) => void;
   showTips: (content: string, autohide?: boolean) => void;
   tips: Accessor<string>;
}) => {
   const [issue, setIssue] = createSignal("");
   const handleSubmitClick = async () => {
      await submitIssue(issue());
      showTips("提交成功!");
      go();
   };
   return (
      <Dialog class="p-2 flex flex-col" title="提交问题" tips={tips}>
         <label for="issue">请在这里描述你的问题:</label>
         <TAInput name="issue" class="grow" binding={[issue, setIssue]}>
            {issue()}
         </TAInput>
         <div class="flex gap-2 mt-2 pb-3 justify-end">
            <Button class="w-24 button btn-normal" onClick={() => go()}>
               取消
            </Button>
            <Button class="w-24 button btn-prime" onClick={handleSubmitClick}>
               提交
            </Button>
         </div>
      </Dialog>
   );
};
