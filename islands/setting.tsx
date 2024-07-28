import { Tags } from "@sholvoir/vocabulary";
import { TagName } from '../lib/tag.ts';
import { useSignal } from "@preact/signals";
import { signals, closeDialog } from "../lib/mem.ts";
import NButton from './button-normal.tsx';
import PButton from './button-prime.tsx';
import TInput from './input-text.tsx';
import MSelect from './select-multi.tsx';
import Dialog from './dialog.tsx';
import { TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { requestInit } from "jsr:@sholvoir/generic@^0.0.5/http";

export default () => {
    const sprint = useSignal(signals.setting.value.sprint);
    const books = useSignal(signals.setting.value.books);

    const handleOKClick = async () => {
        signals.setting.value = { ...signals.setting.value, sprint: sprint.value, books: books.value };
        if ((await fetch('/setting', requestInit(signals.setting.value, 'PUT'))).ok) closeDialog();
    }
    const options = [];
    for (const type of TaskTypes) for (const tag of Tags)
        options.push({value: `${type}${tag}`, label: `${TaskTypeName[type]} - ${TagName[tag]}`});
    return <Dialog title="设置">
        <div class="p-2 h-full">
            <MSelect class="h-[36rem]" binding={books} options={options} title="选择您关注的词书"/>
            <div class="my-2 flex gap-1">
                <label for="sprint" class="shrink-0">每次学习单词数:</label>
                <TInput num name="sprint" binding={sprint} class="grow"/>
            </div>
            <div class="flex justify-end gap-2">
                <NButton class="w-32" onClick={closeDialog}>取消</NButton>
                <PButton class="w-32" onClick={handleOKClick}>确定</PButton>
            </div>
        </div>
    </Dialog>
}