import { useSignal } from "@preact/signals";
import { ITask, TaskType } from "../lib/itask.ts";

export default () => {
    const type = useSignal<TaskType>('L');
    const word = useSignal('');
    const task = useSignal<ITask | null>(null);
    const handleApplyClick = async () => {}

    return <div class="h-full">
        <div class="flex gap-2">
            <input type="text" name="type" placeholder="type" class="grow px-2 border border-gray-300 rounded" onInput={(e: Event) => type.value = (e.target as HTMLInputElement).value as TaskType} value={type.value}/>
            <input type="text" name="word" placeholder="word" class="grow px-2 border border-gray-300 rounded" onInput={(e: Event) => word.value = (e.target as HTMLInputElement).value} value={word.value}/>
            <button class="px-2 bg-indigo-700 text-white active:bg-indigo-950" onClick={handleApplyClick}>apply</button>
        </div>
        <div class="h-full">{JSON.stringify(task.value)}</div>
    </div>
}