import { Signal, useSignal } from "@preact/signals";
import { TaskType, TaskTypes } from "../lib/itask.ts";
import { Tag, Tags } from "vocabulary/tag.ts";
import { TagName } from "../lib/tag.ts";
import { ISetting } from '../lib/isetting.ts';
import * as mem from "../lib/mem.ts";
import Dialog, { IDialogProps } from './dialog.tsx';
import CInput from './input-checkbox.tsx';
import PButton from './button-prime.tsx';

interface IStartProps extends IDialogProps {
    setting: Signal<ISetting>;
    onStartOKClick: (types: TaskType[], tag: Tag) => void;
}
export default ({setting, showTips, onCancel, onStartOKClick}: IStartProps) => {
    const checkTaskTypes = {} as Record<TaskType, Signal<boolean>>;
    for (const type of TaskTypes) checkTaskTypes[type] = useSignal(false);
    const sTag = useSignal<Tag>('OG');
    const showThisAtStart = useSignal(!!setting.value.showStartPage);
    const handleTagInput = (e: Event) => sTag.value = (e.target as HTMLSelectElement).value as Tag;
    const handleOkClick = async () => {
        if (showThisAtStart.value == !setting.value.showStartPage) {
            if (showThisAtStart.value) setting.value.showStartPage = true;
            else delete setting.value.showStartPage;
        }
        await mem.setSetting(setting.value = {...setting.value})
        const types: TaskType[] = [];
        if (checkTaskTypes['L'].value) types.push('L');
        if (checkTaskTypes['R'].value) types.push('R');
        if (!types.length) return showTips!('请选择至少一种训练类型!');
        onStartOKClick(types, sTag.value);
    }
    return <Dialog title="开始学习" onCancel={onCancel}>
        <div class="w-fit mx-auto flex flex-col gap-4">
            <fieldset class="border border-solid border-gray-300 p-2">
                <legend>让我们选择一本词书开始学习吧</legend>
                <select class="p-2" size={1} name="tag" value={sTag.value} onInput={handleTagInput} >
                    {Tags.map(tag => <option value={tag}>{TagName[tag]}</option>)}
                </select>
                <div class="flex gap-3">
                    <CInput label="听力" binding={checkTaskTypes['L']}/>
                    <CInput label="阅读" binding={checkTaskTypes['R']}/>
                </div>
            </fieldset>
            <PButton onClick={handleOkClick}>确定</PButton>
        </div>
        <CInput class="fixed bottom-2 right-3" label="启动时显示本页" binding={showThisAtStart}/>
    </Dialog>;
}