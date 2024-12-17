import { showDialog, startStudy } from "../lib/signals.ts";
import Dialog from './dialog.tsx';
import Button from '@sholvoir/components/islands/button-ripple.tsx';
import Stats from './stats.tsx';
import IconDict from "./icon-dict.tsx";
import IconStudy from "./icon-study.tsx";
import IconMe from "./icon-me.tsx";

export default () => <Dialog title="学习进度" noback>
    <div class="h-full flex flex-col">
        <Stats class="body grow overflow-y-auto"/>
        <div class="tail shrink-0 px-4 pt-2 pb-4 flex gap-3 justify-between [&>button]:grow">
            <Button onClick={()=>showDialog('dict')}><IconDict class="w-9 h-9 inline-block"/>词典</Button>
            <Button onClick={()=>startStudy()}><IconStudy  class="w-9 h-9 inline-block stroke-1"/>学习</Button>
            <Button onClick={()=>showDialog('menu')}><IconMe class="w-9 h-9 inline-block stroke-[4] fill-none stroke-slate-800 dark:stroke-slate-300"/>我</Button>
        </div>
    </div>
</Dialog>