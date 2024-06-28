import { Tag, Tags } from "vocabulary/tag.ts";
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
    const readBooks = useSignal<Tag[]>(signals.setting.value.readBooks)
    const listenBooks = useSignal<Tag[]>(signals.setting.value.listenBooks);

    const handleOKClick = () => {
        setSetting({ ...signals.setting.value, sprintNumber: sprintNumber.peek(), readBooks: readBooks.peek(), listenBooks: listenBooks.peek() });
        closeDialog();
    }
    const options = Tags.map(tag=>({value: tag, label: TagName[tag]}));
    return <Dialog title="设置">
        <div class="p-2 h-full">
            <MSelect class="h-72" binding={readBooks} options={options} title="选择您关注的词书 - 阅读"/>
            <MSelect class="h-72" binding={listenBooks} options={options} title="选择您关注的词书 - 听力"/>
            <div class="my-2 flex gap-1">
                <label for="sprintNumber" class="shrink-0">每次学习单词数:</label>
                <TInput num name="sprintNumber" binding={sprintNumber} class="grow"/>
            </div>
            <div class="flex justify-end gap-2">
                <NButton class="w-32" onClick={closeDialog}>取消</NButton>
                <PButton class="w-32" onClick={handleOKClick}>确定</PButton>
            </div>
        </div>
    </Dialog>
}