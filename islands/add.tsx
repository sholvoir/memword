import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Options } from "@sholvoir/components/lib/options.ts";
import { addTasks } from "../lib/mem.ts";
import { closeDialog, showDialog, totalStats } from "../lib/signals.ts";
import { splitID } from "../lib/wordlist.ts";
import Dialog from './dialog.tsx';
import Select from '@sholvoir/components/islands/select-single.tsx';
import Button from '@sholvoir/components/islands/button-ripple.tsx';

export default () => {
    const search = useSignal('');
    const sTag = useSignal('');
    const wordLists = useSignal<Options>([]);
    const handleInput = (e: InputEvent) => search.value = (e.target as HTMLInputElement).value;
    const handleOkClick = async () => {
        closeDialog();
        showDialog('wait');
        const [user, name] = splitID(sTag.value)!
        await addTasks(user, name);
        await totalStats();
        closeDialog();
    }
    const init = async () => {};
    useEffect(() => {init()}, []);
    return <Dialog title="添加任务">
        <div class="p-2 h-full flex flex-col gap-2">
            <input value={search} onInput={handleInput}/>
            <Select class="shrink select" title="让我们选择一本词书开始学习吧"
                binding={sTag} options={wordLists.value}/>
            <div class="flex gap-2 pb-2 justify-end">
                <Button class="button btn-normal w-32" onClick={closeDialog}>取消</Button>
                <Button class="button btn-prime w-32" onClick={handleOkClick}>确定</Button>
            </div>
        </div>
    </Dialog>;
}