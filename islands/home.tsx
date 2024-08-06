import { showDialog, startStudy } from "../lib/mem.ts";
import Button from '@sholvoir/components/islands/button-ripple.tsx';
import Stats from './stats.tsx';
import IconDict from "./icon-dict.tsx";
import IconStudy from "./icon-study.tsx";
import IconMe from "./icon-me.tsx";

export default () => <div class="fixed inset-0 flex flex-col">
    <div class="shrink-0 px-2 w-[env(titlebar-area-width,100%)] ml-[env(titlebar-area-x,0)] h-[env(titlebar-area-height,38px)] [app-region:drag] flex justify-center items-center font-bold">学习进度</div>
    <Stats class="grow bg-slate-200 dark:bg-slate-800 overflow-y-auto"/>
    <div class="shrink-0 px-4 pt-1 pb-2 bg-slate-300 dark:bg-slate-700 fill-slate-800 dark:fill-slate-300 flex gap-3 justify-between [&>button]:grow">
        <Button onClick={()=>showDialog({dial:'dict'})}><IconDict class="w-9 h-9 inline-block"/>词典</Button>
        <Button onClick={()=>startStudy()}><IconStudy  class="w-9 h-9 inline-block stroke-1"/>学习</Button>
        <Button onClick={()=>showDialog({dial:'menu'})}><IconMe class="w-9 h-9 inline-block stroke-[4] fill-none stroke-slate-800 dark:stroke-slate-300"/>我</Button>
    </div>
</div>