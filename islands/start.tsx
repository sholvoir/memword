import { Signal, useSignal } from "@preact/signals";
import { TaskType, TASK_TYPES } from "../lib/itask.ts";
import { Tag, Tags } from "@sholvoir/vocabulary";
import { TagName } from "../lib/tag.ts";
import { showDialog, closeDialog, showTips, startStudy, addTasks } from "../lib/mem.ts";
import { } from "../lib/worker.ts";
import Dialog from './dialog.tsx';
import Checkbox from '@sholvoir/components/islands/checkbox.tsx';
import Select from '@sholvoir/components/islands/select-single.tsx';
import Button from '@sholvoir/components/islands/button-ripple.tsx';

export default () => {
    const checkTaskTypes = {} as Record<TaskType, Signal<boolean>>;
    for (const type of TASK_TYPES) checkTaskTypes[type] = useSignal(false);
    const sTag = useSignal<Tag>('OG');
    const handleOkClick = async () => {
        let types = '';
        if (checkTaskTypes['L'].value) types += 'L';
        if (checkTaskTypes['R'].value) types += 'R';
        if (!types.length) return showTips('请选择至少一种训练类型!');
        closeDialog();
        showDialog({dial: 'wait', prompt: '请稍候...' });
        await addTasks(types, sTag.value);
        closeDialog();
        startStudy(types, sTag.value);
    }
    return <Dialog title="开始学习">
        <div class="p-2 h-full flex flex-col gap-2">
            <Select class="shrink select" binding={sTag} options={Tags.map(tag=>({value: tag, label: TagName[tag]}))} title="让我们选择一本词书开始学习吧"/>
            <div class="flex gap-5">
                <Checkbox label="听力" binding={checkTaskTypes['L']}/>
                <Checkbox label="阅读" binding={checkTaskTypes['R']}/>
            </div>
            <div class="flex gap-2 pb-2 justify-end">
                <Button class="button btn-normal w-32" onClick={closeDialog}>取消</Button>
                <Button class="button btn-prime w-32" onClick={handleOkClick}>确定</Button>
            </div>
        </div>
    </Dialog>;
}