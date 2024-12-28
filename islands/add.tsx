import { useSignal } from "@preact/signals";
import { Tag, Tags } from "@sholvoir/vocabulary";
import { TagName } from "../lib/tag.ts";
import { addTasks } from "../lib/mem.ts";
import { closeDialog, showDialog, totalStats } from "../lib/signals.ts";
import Dialog from './dialog.tsx';
import Select from '@sholvoir/components/islands/select-single.tsx';
import Button from '@sholvoir/components/islands/button-ripple.tsx';

export default () => {
    const sTag = useSignal<Tag>('OG');
    const handleOkClick = async () => {
        closeDialog();
        showDialog('wait');
        await addTasks(sTag.value);
        await totalStats();
        closeDialog();
    }
    return <Dialog title="添加任务">
        <div class="p-2 h-full flex flex-col gap-2">
            <Select class="shrink select" title="让我们选择一本词书开始学习吧"
                binding={sTag} options={Tags.map(tag=>({value: tag, label: TagName[tag]}))}/>
            <div class="flex gap-2 pb-2 justify-end">
                <Button class="button btn-normal w-32" onClick={closeDialog}>取消</Button>
                <Button class="button btn-prime w-32" onClick={handleOkClick}>确定</Button>
            </div>
        </div>
    </Dialog>;
}