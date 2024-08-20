import { Tags } from "@sholvoir/vocabulary";
import { TagName } from '../lib/tag.ts';
import { useSignal } from "@preact/signals";
import { signals, closeDialog } from "../lib/mem.ts";
import { TaskTypeName, TASK_TYPES } from "../lib/itask.ts";
import { now, setSetting, syncSetting } from "../lib/worker.ts";
import Button from '@sholvoir/components/islands/button-ripple.tsx';
import TInput from '@sholvoir/components/islands/input-text.tsx';
import MSelect from '@sholvoir/components/islands/select-multi.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const sprint = useSignal(signals.setting.value.sprint);
    const books = useSignal(signals.setting.value.books);

    const handleOKClick = () => {
        signals.setting.value = { ...signals.setting.value, version: now(), sprint: sprint.value, books: books.value };
        setSetting(signals.setting.value);
        syncSetting();
        closeDialog();
    }
    const options = [];
    for (const type of TASK_TYPES) for (const tag of Tags)
        options.push({value: `${type}${tag}`, label: `${TaskTypeName[type]} - ${TagName[tag]}`});
    return <Dialog title="设置">
        <div class="p-2 h-full flex flex-col">
            <MSelect class="shrink select" binding={books} options={options} title="选择您关注的词书"/>
            <div class="my-2 flex gap-1">
                <label for="sprint" class="shrink-0">每次学习单词数:</label>
                <TInput num name="sprint" binding={sprint} class="grow"/>
            </div>
            <div class="flex justify-end gap-2 pb-2">
                <Button class="w-32 button btn-normal" onClick={closeDialog}>取消</Button>
                <Button class="w-32 button btn-prime" onClick={handleOKClick}>确定</Button>
            </div>
        </div>
    </Dialog>
}