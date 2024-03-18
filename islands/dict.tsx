import { useSignal } from "@preact/signals";
import { signals, searchWord, closeDialog, showDialog, showTips } from "../lib/mem.ts";
import PButton from './button-prime.tsx';
import TInput from './input-text.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const word = useSignal('');
    const handleSearchClick = async () => {
        const text = word.value.trim();
        if (!text) return;
        showDialog({ dial: 'wait', prompt: '请稍候...' });
        const ts = await searchWord(text);
        closeDialog();
        if (!ts) showTips('Not Found!'); else {
            signals.studies.value = [ts];
            signals.isPhaseAnswer.value = true;
            showDialog({ dial: 'study' });
        }
    }
    return <Dialog title="词典">
        <TInput type="search" name="word" placeholder="word" class="m-2 w-[calc(100%-16px)]" binding={word} onChange={handleSearchClick}/>
    </Dialog>;
}