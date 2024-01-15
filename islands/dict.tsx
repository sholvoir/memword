import { useSignal } from "@preact/signals";
import { ShowDialog } from "./root.tsx";
import { ITask } from "../lib/itask.ts";
import * as mem from '../lib/mem.ts'
import { IStudy } from "../lib/istudy.ts";

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
        else startStudy([{task, dict: await mem.getDict(task.word)}])
    }
    return <div class="flex">
        <input type="text" name="word" placeholder="word"
            class="grow border px-2" value={word.value}
            onInput={handleInput} onChange={handleSearchClick}/>
        <button type="button" class="w-20 border rounded-md px-2 bg-indigo-700 text-white"
            onClick={handleSearchClick}>Search</button>
    </div>
}