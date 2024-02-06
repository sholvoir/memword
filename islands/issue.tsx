import { useSignal } from "@preact/signals";
import { submitIssue } from "../lib/mem.ts";
import NButton from './button-normal.tsx';
import PButton from './button-prime.tsx'
import TAInput from './input-textarea.tsx';
import Dialog, { IDialogProps } from './dialog.tsx';

export default ({ onCancel, showTips }: IDialogProps) => {
    const issue = useSignal('');
    const handleSubmitClick = async () => {
        const resp = await submitIssue(issue.value);
        if (!resp.ok) return showTips!('网络错误，未提交成功!');
        showTips!('提交成功!');
        onCancel();
    }
    return <Dialog title="提交问题" onCancel={onCancel}>
        <div class="p-2 h-full flex flex-col">
            <label for="issue">请在这里描述你的问题:</label>
            <TAInput name="issue" class="w-full h-96 grow" binding={issue}>{issue.value}</TAInput>
            <div class="flex gap-2 mt-2 justify-end">
                <NButton class="w-32" onClick={onCancel}>取消</NButton>
                <PButton class="w-32" onClick={handleSubmitClick}>提交</PButton>
            </div>
        </div>
    </Dialog>
}