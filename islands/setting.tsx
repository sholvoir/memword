import { TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { Tags } from "vocabulary/tag.ts";
import { TagName } from '../lib/tag.ts';
import { useSignal } from "@preact/signals";
import { signals, closeDialog, setSetting } from "../lib/mem.ts";
import NButton from './button-normal.tsx';
import PButton from './button-prime.tsx';
import TInput from './input-text.tsx';
import MSelect from './select-multi.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const sprintNumber = useSignal(signals.setting.value.sprintNumber);
    const wordBooks = useSignal<string[]>(signals.setting.value.wordBooks);

    const handleOKClick = () => {
        setSetting({ ...signals.setting.value, sprintNumber: sprintNumber.peek(), wordBooks: wordBooks.peek() });
        closeDialog();
    }
    const options = [];
    for (const taskType of TaskTypes) for (const tag of Tags) {
        const id = `${taskType}${tag}`;
        options.push({value: id, label: `${TaskTypeName[taskType]}-${TagName[tag]}`});
    }
    return <Dialog title="设置">
        <div class="p-2 h-full">
            <MSelect class="h-96" binding={wordBooks} options={options} title="选择您关注的词书"/>
            <div class="my-2 flex gap-1">
                <label for="sprintNumber">每次学习单词数:</label>
                <TInput num name="sprintNumber" binding={sprintNumber} class="grow"/>
            </div>
            <div class="flex justify-end gap-2">
                <NButton class="w-32" onClick={closeDialog}>取消</NButton>
                <PButton class="w-32" onClick={handleOKClick}>确定</PButton>
            </div>
        </div>
    </Dialog>
}