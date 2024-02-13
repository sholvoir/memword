import { Tag, Tags } from "vocabulary/tag.ts";
import { TagName } from '../lib/tag.ts';
import { BLevelName, BLevels } from "../lib/istat.ts";
import { TaskType, TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { iStatToIBStat } from "../lib/istat.ts";
import { signals, startStudy } from '../lib/mem.ts';

export default () => {
    const getResult = () => {
        const result = [];
        for (const tt of signals.setting.value.wordBooks) {
            const taskType = tt[0] as TaskType;
            const tag = tt.slice(1) as Tag;
            const statAll = iStatToIBStat(signals.stats.value.all[taskType][tag]);
                const statTask = iStatToIBStat(signals.stats.value.task[taskType][tag])
                const all = signals.stats.value.all[taskType][tag].reduce((s,b) => s + b, 0);
                result.push(<div class="grow min-w-80 grid gap-x-1 grid-cols-[max-content_1fr] items-center">
                    <div class="col-span-2 text-center font-bold">
                        <a class="hover:cursor-pointer hover:underline" onClick={() => startStudy(taskType, tag)}>{TaskTypeName[taskType]}-{TagName[tag]} - {all}</a>
                    </div>
                    {BLevels.map(blevel => {
                        const value = statAll[blevel];
                        const task = statTask[blevel];
                        return <>
                            <div class="text-left">{BLevelName[blevel]}</div>
                            <div class="relative bg-slate-300 dark:bg-slate-700 h-6 py-1 w-full hover:cursor-pointer" onClick={(ev: Event) => (ev.stopPropagation(), startStudy(taskType, tag, blevel))}>
                                <div class="my-auto h-4 bg-slate-400" style={`width: ${value * 100 / all}%`}>
                                    <div class="ml-auto h-full bg-orange-500" style={`width: ${value ? (task * 100 / value) : 0}%`}/>
                                </div>
                                <div class="absolute top-0 right-1">{task}|{value}</div>
                            </div>
                        </>
                    })}
                </div>);
        }
        return result;
    }
    return <>
        <div class="shrink-0 px-2 w-[env(titlebar-area-width,100%)] ml-[env(titlebar-area-x,0)] h-[env(titlebar-area-height,38px)] [app-region:drag] bg-slate-300 dark:bg-slate-900 flex justify-center items-center font-bold">学习进度</div>
        <div class="grow overflow-y-auto"><div class="p-2 flex flex-wrap justify-between gap-4">{getResult()}</div></div>
    </>;
}