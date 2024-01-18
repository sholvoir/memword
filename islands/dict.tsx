import { useSignal } from "@preact/signals";
import { ShowDialog } from "./root.tsx";
import { IStudy } from "../lib/istudy.ts";
import * as mem from '../lib/mem.ts'

interface DictProps {
    showDialog: ShowDialog;
    startStudy: (studies: Array<IStudy>) => void;
}
export default ({showDialog, startStudy}: DictProps) => {
    const word = useSignal('');
    const handleInput = (e: Event) => word.value = (e.target as HTMLInputElement).value;
    const handleSearchClick = async () => {
        const task = await mem.getTask('R', word.value);
        if (!task) showDialog('Not Found!', 'dict');
        else {
            const dict = await mem.getDiction(task.word);
            startStudy([{...task, ...dict} as IStudy]);
        }
    }
    return <div class="flex">
        <input type="text" name="word" placeholder="word"
            class="grow border px-2" value={word.value}
            onInput={handleInput} onChange={handleSearchClick}/>
        <button type="button" class="w-20 border rounded-md px-2 bg-indigo-700 text-white active:bg-indigo-950"
            onClick={handleSearchClick}>Search</button>
    </div>
}