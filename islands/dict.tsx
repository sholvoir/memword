import { useSignal } from "@preact/signals";
import { getTask } from "../lib/mem.ts";
import { ShowDialog } from "./root.tsx";
import { ITask } from "../lib/itask.ts";

interface DictProps {
    showDialog: ShowDialog;
    startStudy: (ts: ITask[]) => Promise<void>;
}
export default ({showDialog, startStudy}: DictProps) => {
    const word = useSignal('');
    const handleInput = (e: Event) => word.value = (e.target as HTMLInputElement).value;
    const handleSearchClick = async () => {
        const task = await getTask('R', word.value);
        if (!task) showDialog('Not Found!', 'dict');
        else await startStudy([task])
    }
    return <div class="flex">
        <input type="text" name="word" placeholder="word"
            class="grow border px-2" value={word.value}
            onInput={handleInput} onChange={handleSearchClick}/>
        <button type="button" class="w-20 border rounded-md px-2 bg-blue-800 text-white"
            onClick={handleSearchClick}>Search</button>
    </div>
}