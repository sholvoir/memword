import { IStat } from "../lib/istat.ts";
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Button from './button-ripple.tsx';
import Stat from './stat.tsx';
import IconDict from "./icon-dict.tsx";
import IconStudy from "./icon-study.tsx";
import IconMe from "./icon-me.tsx";

export default () => <Dialog title="学习进度">
    <div class="body grow overflow-y-auto">
        <div class="p-2 flex flex-wrap justify-between gap-4">
            {app.stats.value.stats.map((stat: IStat)=><Stat stat={stat}/>)}
        </div>
    </div>
    <div class="tail shrink-0 px-4 pt-2 pb-4 flex gap-3 justify-between [&>button]:grow">
        <Button onClick={()=>app.go('search')}><IconDict class="w-9 h-9 inline-block"/>词典</Button>
        <Button onClick={()=>app.startStudy()}><IconStudy  class="w-9 h-9 inline-block stroke-1"/>学习</Button>
        <Button onClick={()=>app.go('menu')}><IconMe class="w-9 h-9 inline-block stroke-[4] fill-none stroke-slate-800 dark:stroke-slate-300"/>我</Button>
    </div>
</Dialog>