// deno-lint-ignore-file no-explicit-any
import { TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { Tags } from "vocabulary/tag.ts";
import { TagName } from '../lib/tag.ts';
import { Signal, useSignal } from "@preact/signals";
import { ISetting } from "../lib/isetting.ts";
import * as mem from "../lib/mem.ts";
import NButton from './button-normal.tsx';
import PButton from './button-prime.tsx';
import TInput from './input-text.tsx';
import CInput from './input-checkbox.tsx';

interface ISettingProps {
    setting: Signal<ISetting>;
    onFinished: () => void;
};

export default (props: ISettingProps) => {
    const setting = mem.getSetting();
    const sprintNumber = useSignal(setting.sprintNumber);
    const checkBoxs = {} as any;

    const handleCheckboxChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        setting.wordBooks[target.name] = checkBoxs[target.name].value;
    }
    const handleSprintNuberChange = () => setting.sprintNumber = sprintNumber.value;
    const handleOKClick = () => {
        mem.setSetting(setting);
        props.setting.value = setting;
        props.onFinished();
    }
    const result = [];
    for (const taskType of TaskTypes) for (const tag of Tags) {
        const id = `${taskType}${tag}`;
        checkBoxs[id] = useSignal(setting.wordBooks[id]);
        result.push(<CInput name={id} class="w-96" binding={checkBoxs[id]} label={`${TaskTypeName[taskType]}-${TagName[tag]}`} onChange={handleCheckboxChange}/>);
    }
    return <>
        <div class="flex gap-2">
            <label for="sprintNumber">每次学习单词数:</label>
            <TInput num name="sprintNumber" binding={sprintNumber} class="grow" onChange={handleSprintNuberChange}/>
        </div>
        <fieldset class="border border-solid border-gray-300 p-3 flex flex-wrap gap-2">
            <legend>选择您关注的词书</legend>
            {result}
        </fieldset>
        <div class="m-2 flex justify-end gap-2">
            <NButton class="w-32" onClick={props.onFinished}>取消</NButton>
            <PButton class="w-32" onClick={handleOKClick}>确定</PButton>
        </div>
    </>
}