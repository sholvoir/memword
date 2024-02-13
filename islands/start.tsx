import { Signal, useSignal } from "@preact/signals";
import { TaskType, TaskTypes } from "../lib/itask.ts";
import { Tag, Tags } from "vocabulary/tag.ts";
import { TagName } from "../lib/tag.ts";
import { signals, setSetting, showDialog, closeDialog, showTips, addTasks, startStudy } from "../lib/mem.ts";
import Dialog from './dialog.tsx';
import Checkbox from './checkbox.tsx';
import Select from './select-single.tsx';
import NButton from './button-normal.tsx';
import PButton from './button-prime.tsx';

export default () => {
    const checkTaskTypes = {} as Record<TaskType, Signal<boolean>>;
    for (const type of TaskTypes) checkTaskTypes[type] = useSignal(false);
    const sTag = useSignal<Tag>('OG');
    const showThisAtStart = useSignal(!!signals.setting.peek().showStartPage);
    const handleShowAtStartChange = async () => {
        if (showThisAtStart.value == !signals.setting.value.showStartPage) {
            if (showThisAtStart.value) signals.setting.value.showStartPage = true;
            else delete signals.setting.value.showStartPage;
        }
        await setSetting({...signals.setting.value});
    }
    const handleOkClick = async () => {
        const types: TaskType[] = [];
        if (checkTaskTypes['L'].value) types.push('L');
        if (checkTaskTypes['R'].value) types.push('R');
        if (!types.length) return showTips('请选择至少一种训练类型!');
        closeDialog();
        showDialog({dial: 'wait', prompt: '请稍候...' });
        await addTasks(types, sTag.value);
        closeDialog();
        startStudy(types.join(''), sTag.value);
    }
    return <Dialog title="开始学习">
        <div class="p-2 h-full flex flex-col gap-2">
            <Select class="h-[640px]" binding={sTag} options={Tags.map(tag=>({value: tag, label: TagName[tag]}))} title="让我们选择一本词书开始学习吧"/>
            <div class="flex gap-5">
                <Checkbox label="听力" binding={checkTaskTypes['L']}/>
                <Checkbox label="阅读" binding={checkTaskTypes['R']}/>
            </div>
            <div class="flex gap-2 justify-end">
                <NButton class="w-32" onClick={closeDialog}>取消</NButton>
                <PButton class="w-32" onClick={handleOkClick}>确定</PButton>
            </div>
        </div>
        <Checkbox class="fixed bottom-2 right-3" label="启动时显示本页" binding={showThisAtStart} onChange={handleShowAtStartChange}/>
    </Dialog>;
}