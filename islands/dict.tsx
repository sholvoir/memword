import { useSignal } from "@preact/signals";
import PButton from './button-prime.tsx';
import TInput from './input-text.tsx';
import Tab from './tab.tsx';

interface DictProps {
    handleSearchWord: (word: string) => void;
}
export default ({handleSearchWord}: DictProps) => {
    const word = useSignal('');
    const handleSearchClick = () => handleSearchWord(word.value);
    return <Tab title="词典">
        <div class="p-2 flex gap-2">
            <TInput type="search" name="word" placeholder="word" class="grow" binding={word} onSearch={handleSearchClick}/>
            <PButton class="w-20" onClick={handleSearchClick}>查找</PButton>
        </div>
    </Tab>;
}