import { useSignal } from "@preact/signals";
import { submitIssue } from "../lib/worker.ts";
import { showTips, closeDialog } from '../lib/mem.ts';
import Button from '@sholvoir/components/islands/button-ripple.tsx';
import TAInput from '@sholvoir/components/islands/input-textarea.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const issue = useSignal('');
    const handleSubmitClick = async () => {
        const resp = await submitIssue(issue.value);
        if (!resp.ok) return showTips('网络错误，未提交成功!');
        showTips('提交成功!');
        closeDialog();
    }
    return <Dialog title="提交问题">
        <div class="p-2 h-full flex flex-col">
            <label>请在这里描述你的问题:</label>
            <TAInput name="issue" class="w-full grow" binding={issue}>{issue.value}</TAInput>
            <div class="flex gap-2 mt-2 pb-2 justify-end">
                <Button class="w-32 btn-normal" onClick={closeDialog}>取消</Button>
                <Button class="w-32 btn-prime" onClick={handleSubmitClick}>提交</Button>
            </div>
        </div>
    </Dialog>
}