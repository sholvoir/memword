import { useSignal } from "@preact/signals";
import { signals, showWaiting, searchWord, closeDialog, showDialog, showTips } from "../lib/mem.ts";
import PButton from './button-prime.tsx';
import TInput from './input-text.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const word = useSignal('');
    const handleSearchWord = async (word: string) => {
        showWaiting('请稍候...');
        const ts = await searchWord(word);
        closeDialog();
        if (!ts) showTips('Not Found!'); else {
            signals.studies.value = [ts];
            showDialog('study');
        }
    }
    const handleSearchClick = () => handleSearchWord(word.value);
    return <Dialog title="词典">
        <div class="p-2 flex gap-2">
            <TInput type="search" name="word" placeholder="word" class="grow" binding={word} onSearch={handleSearchClick}/>
            <PButton class="w-20" onClick={handleSearchClick}>查找</PButton>
        </div>
    </Dialog>;
}