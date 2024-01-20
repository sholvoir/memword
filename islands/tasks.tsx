import { useSignal } from "@preact/signals";
import { ITask, TaskType } from "../lib/itask.ts";
import TInput from './input-text.tsx';
import PButton from './button-prime.tsx';

export default () => {
    const type = useSignal<TaskType>('L');
    const word = useSignal('');
    const task = useSignal<ITask | null>(null);
    const handleApplyClick = async () => {}

    return <div class="h-full">
        <div class="flex gap-2">
            <TInput name="type" placeholder="type" class="grow" binding={type}/>
            <TInput name="word" placeholder="word" class="grow" binding={word}/>
            <PButton class="px-2 bg-indigo-700 text-white active:bg-indigo-950" onClick={handleApplyClick}>Apply</PButton>
        </div>
        <div class="h-full">{JSON.stringify(task.value)}</div>
    </div>
}