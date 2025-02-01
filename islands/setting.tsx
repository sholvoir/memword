import { useSignal } from "@preact/signals";
import { getSetting, setSetting } from "../lib/mem.ts";
import type { Options } from "@sholvoir/components/lib/options.ts";
import { closeDialog, showTips } from "../lib/signals.ts";
import { useEffect } from "preact/hooks";
import { ISetting, settingFormat } from "../lib/isetting.ts";
import Button from '@sholvoir/components/islands/button-ripple.tsx';
import MSelect from '@sholvoir/components/islands/select-multi.tsx';
import Dialog from './dialog.tsx';
import { now } from "../lib/common.ts";

export default () => {
    const books = useSignal<Array<string>>([]);
    const handleOKClick = () => {
        setSetting({format: settingFormat, version: now(), books: books.value});
        closeDialog();
    }
    const options: Options = [];
    const init = async () => {
        const res = await getSetting();
        if (!res.ok) return showTips('ServiceWorker Error!');
        const setting: ISetting = await res.json();
        books.value = setting.books;
    }
    useEffect(() => {init()}, []);
    return <Dialog title="设置">
        <div class="p-2 h-full flex flex-col gap-2">
            <MSelect class="shrink grow select" binding={books} options={options} title="选择您关注的词书"/>
            <div class="flex justify-end gap-2 pb-2">
                <Button class="w-32 button btn-normal" onClick={closeDialog}>取消</Button>
                <Button class="w-32 button btn-prime" onClick={handleOKClick}>确定</Button>
            </div>
        </div>
    </Dialog>
}