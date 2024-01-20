import { useSignal } from "@preact/signals";
import { submitIssue } from "../lib/mem.ts";
import { Loca } from "./root.tsx";
import PButton from './button-prime.tsx'
import TAInput from './input-textarea.tsx';

interface IIssueProps {
    showDialog: (content: string, backLoca: Loca) => void
}

export default ({ showDialog }: IIssueProps) => {
    const issue = useSignal('');
    const handleSubmitClick = async () => {
        const resp = await submitIssue(issue.value);
        if (!resp.ok) showDialog(await resp.text(), 'issue');
        else showDialog('Submit Success!', 'stats');
    }

    return <div class="h-full flex flex-col">
        <label for="issue">Please describe your problem or the only a word with issue:</label>
        <TAInput name="issue" class="w-full grow" binding={issue}>{issue.value}</TAInput>
        <div class="flex mt-2 justify-end">
            <PButton onClick={handleSubmitClick}>Submit</PButton>
        </div>
    </div>
}