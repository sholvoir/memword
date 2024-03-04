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
        <div class="p-2 flex gap-2">
            <TInput type="search" name="word" placeholder="word" class="grow" binding={word} onSearch={handleSearchClick}/>
            <PButton class="w-20" onClick={handleSearchClick}>查找</PButton>
        </div>
    </Dialog>;
}