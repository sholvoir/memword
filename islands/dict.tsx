import { useSignal } from "@preact/signals";
import { IStudy } from "../lib/istudy.ts";
import * as mem from '../lib/mem.ts'
import PButton from './button-prime.tsx';
import TInput from './input-text.tsx';

interface DictProps {
    showTips: (content: string) => void;
    startStudy: (studies: Array<IStudy>) => void;
}
export default ({showTips, startStudy}: DictProps) => {
    const word = useSignal('');
    const handleSearchClick = async () => {
        const study = await mem.searchWord(word.value);
        if (!study) showTips('Not Found!');
        else startStudy([study]);
    }
    return <div class="flex gap-2">
        <TInput type="search" name="word" placeholder="word" class="grow" binding={word} onSearch={handleSearchClick}/>
        <PButton class="w-20" onClick={handleSearchClick}>查找</PButton>
    </div>
}