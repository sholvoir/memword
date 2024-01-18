import { useSignal } from "@preact/signals";
import { submitIssue } from "../lib/mem.ts";
import { Loca } from "./root.tsx";

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
        <textarea name="issue" class="w-full grow p-2 border border-gray-300 rounded"
            onInput={(e: Event) => issue.value = (e.target as HTMLTextAreaElement).value }>
            {issue.value}
        </textarea>
        <div class="flex mt-2 justify-end">
            <button class="px-2 bg-indigo-700 text-white active:bg-indigo-950" onClick={handleSubmitClick}>Submit</button>
        </div>
    </div>
}