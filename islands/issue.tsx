import { useSignal } from "@preact/signals";
import { submitIssue } from "../lib/mem.ts";
import PButton from './button-prime.tsx'
import TAInput from './input-textarea.tsx';
import Dialog from './dialog.tsx';

interface IIssueProps {
    onFinish: () => void;
    showTips: (content: string) => void;
}
export default ({ onFinish, showTips }: IIssueProps) => {
    const issue = useSignal('');
    const handleSubmitClick = async () => {
        const resp = await submitIssue(issue.value);
        if (!resp.ok) return showTips('网络错误，未提交成功!');
        showTips('提交成功!');
        onFinish();
    }
    return <Dialog title="提交问题" onFinish={onFinish}>
        <div class="h-full flex flex-col">
            <label for="issue">请在这里描述你的问题:</label>
            <TAInput name="issue" class="w-full grow" binding={issue}>{issue.value}</TAInput>
            <div class="flex mt-2 justify-end">
                <PButton class="px-4" onClick={handleSubmitClick}>提交</PButton>
            </div>
        </div>
    </Dialog>
}