import { useSignal } from "@preact/signals";
import { signals, showDialog, showTips } from "../lib/signals.ts";
import TInput from '@sholvoir/components/islands/input-text.tsx';
import Dialog from './dialog.tsx';
import { search } from "../lib/mem.ts";

export default () => {
    const word = useSignal('');
    const handleSearchClick = async () => {
        const text = word.value.trim();
        if (!text) return;
        const res = await search(text);
        if (!res.ok) return showTips('Not Found!');
        const task = await res.json();
        signals.tasks.value = [task];
        signals.isPhaseAnswer.value = true;
        showDialog({ dial: 'study' });
    }
    return <Dialog title="词典">
        <TInput type="search" name="word" placeholder="word" class="m-2 w-[calc(100%-16px)]"
            binding={word} onChange={handleSearchClick} options={signals.vocabulary.value}/>
    </Dialog>;
}