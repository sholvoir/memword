import { useSignal } from "@preact/signals";
import { signals, showDialog, showTips } from "../lib/mem.ts";
import { search } from "../lib/worker.ts";
import TInput from '@sholvoir/components/islands/input-text.tsx';
import Dialog from './dialog.tsx';
import { worker } from "../lib/worker.ts";

export default () => {
    const word = useSignal('');
    const handleSearchClick = async () => {
        const text = word.value.trim();
        if (!text) return;
        const task = await search(text);
        if (!task) return showTips('Not Found!');
        signals.tasks.value = [task];
        signals.isPhaseAnswer.value = true;
        showDialog({ dial: 'study' });
    }
    return <Dialog title="词典">
        <TInput type="search" name="word" placeholder="word" class="border m-2 w-[calc(100%-16px)]"
            binding={word} onChange={handleSearchClick} options={worker.vocabulary}/>
    </Dialog>;
}