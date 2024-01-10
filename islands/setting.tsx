import { getSetting, setSetting } from '../lib/mem.ts';
import { TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { TagName, Tags } from "vocabulary/tag.ts";
import { useSignal } from "@preact/signals";

interface ISettingProps {
    onFinished: () => void;
};

export default ({onFinished}: ISettingProps) => {
    const isModified = useSignal(false);
    const setting = getSetting();
    const handleCheckboxChange = (e: Event) => {
        isModified.value = true;
        const target = e.target as HTMLInputElement;
        setting[target.name] = target.checked;
    }
    const result = [];
    for (const taskType of TaskTypes) for (const tag of Tags) {
        const id = `${taskType}${tag}`;
        result.push(<div><input type="checkbox" name={id} checked={setting[id]} onChange={handleCheckboxChange}/>
            <label for={id}> {TaskTypeName[taskType]} {TagName[tag]}</label></div>)
    }
    return <>
        <fieldset class="border border-solid border-gray-300 p-3 flex flex-wrap [&>div]:min-w-40">
            <legend>Select Your Word Books</legend>
            {result}
        </fieldset>
        <div class="m-2 flex justify-end [&>button]:w-32 [&>button]:p-2 [&>button]:rounded gap-2">
            <button class="bg-gray-300" onClick={onFinished}>Cancel</button>
            <button class="bg-indigo-700 text-white" onClick={() => { setSetting(setting); onFinished(); }} disabled={!isModified.value}>Save</button>
        </div>
    </>
}