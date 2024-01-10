// deno-lint-ignore-file no-explicit-any
import { getSetting, setSetting } from '../lib/mem.ts';
import { TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { TagName, Tags } from "vocabulary/tag.ts";
import { useSignal } from "@preact/signals";

interface ISettingProps {
    onFinished: () => void;
};

export default ({onFinished}: ISettingProps) => {
    const setting = getSetting();
    const isModified = useSignal(false);
    const sprintNumber = useSignal(setting.sprintNumber);
    const checkBoxs = {} as any;

    const handleCheckboxChange = (e: Event) => {
        isModified.value = true;
        const target = e.target as HTMLInputElement;
        checkBoxs[target.name].value = setting.wordBooks[target.name] = target.checked;
    }
    const handleLableClick = (e: Event) => {
        isModified.value = true;
        const target = e.target as HTMLLabelElement;
        checkBoxs[target.htmlFor].value = setting.wordBooks[target.htmlFor] = !setting.wordBooks[target.htmlFor];
    }
    const handleSprintNuberChange = (e: Event) => {
        isModified.value = true;
        const target = e.target as HTMLInputElement;
        sprintNumber.value = setting.sprintNumber = Number.parseInt(target.value);
    }
    const result = [];
    for (const taskType of TaskTypes) for (const tag of Tags) {
        const id = `${taskType}${tag}`;
        checkBoxs[id] = useSignal(setting.wordBooks[id]);
        result.push(<div><input type="checkbox" name={id} checked={checkBoxs[id].value} onChange={handleCheckboxChange}/>
            <label for={id} onClick={handleLableClick}> {TaskTypeName[taskType]} {TagName[tag]}</label></div>)
    }
    return <>
        <div class="flex">
            <label for="sprintNumber">Sprint Number:</label>
            <input type="text" name="sprintNumber" class="grow px-2 rounded border border-gray-500" onInput={handleSprintNuberChange}/>
        </div>
        <fieldset class="border border-solid border-gray-300 p-3 flex flex-wrap [&>div]:min-w-40">
            <legend>Select Your Word Books</legend>
            {result}
        </fieldset>
        <div class="m-2 flex justify-end [&>button]:w-32 [&>button]:p-2 [&>button]:rounded gap-2">
            <button class="bg-gray-300" onClick={onFinished}>Cancel</button>
            <button class="bg-indigo-700 text-white" onClick={() => (setSetting(), onFinished())} disabled={!isModified.value}>Save</button>
        </div>
    </>
}