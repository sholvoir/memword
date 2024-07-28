import { useSignal } from "@preact/signals";
import { signals, showDialog, showTips } from "../lib/mem.ts";
import TInput from './input-text.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const word = useSignal('');
    const handleSearchClick = async () => {
        const text = word.value.trim();
        if (!text) return;
        const req = await fetch(`/search?word=${encodeURIComponent(text)}`);
        if (!req.ok) return showTips('Not Found!');
        const task = await req.json();
        signals.tasks.value = [task];
        signals.isPhaseAnswer.value = true;
        showDialog({ dial: 'study' });
    }
    return <Dialog title="词典">
        <TInput type="search" name="word" placeholder="word" class="m-2 w-[calc(100%-16px)]" binding={word} onChange={handleSearchClick}/>
    </Dialog>;
}