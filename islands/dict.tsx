import { useSignal } from "@preact/signals";
import { signals, showDialog, showTips } from "../lib/signals.ts";
import { search } from "../lib/mem.ts";
import TInput from '@sholvoir/components/islands/input-text.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const word = useSignal('');
    const handleSearchClick = async () => {
        const text = word.value.trim();
        if (!text) return;
        const res = await search(text);
        if (!res.ok) return showTips('Not Found!');
        const item = await res.json();
        signals.item.value = item;
        signals.isPhaseAnswer.value = true;
        signals.sprint.value = -1;
        showDialog('study');
    }
    return <Dialog title="词典">
        <TInput autoCapitalize="none" type="search" name="word" placeholder="word" class="m-2 w-[calc(100%-16px)]"
            binding={word} onChange={handleSearchClick} options={signals.vocabulary.value}/>
    </Dialog>;
}