// deno-lint-ignore-file no-explicit-any
import { Tag } from "vocabulary/tag.ts";
import { TagName } from '../lib/tag.ts';
import { BLevel, IStats } from "../lib/istat.ts";
import { TaskType, TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { iStatToIBStat } from "../lib/istat.ts";
import { signals, startStudy } from '../lib/mem.ts';
import Stat from './stat.tsx';

export default () => {
    const getResult = () => {
        const result = [] as Array<any>;
        const stats: IStats = signals.stats.value;
        const push1 = (taskType: TaskType) => {
            const width = stats.allT[taskType].reduce((s,b) => s + b) - stats.allT[taskType][0] + stats.taskT[taskType][0];
            const task = stats.taskT[taskType].reduce((s,b) => s + b);
            const statTask = iStatToIBStat(stats.taskT[taskType]);
            const statAll = iStatToIBStat(stats.allT[taskType]);
            statAll.never = statTask.never;
            result.push(<Stat onTitleClick={() => startStudy(taskType)}
                onItemClick={(blevel: BLevel) => startStudy(taskType, undefined, blevel)} 
                title={`${TaskTypeName[taskType]} - ${task}|${width}`} width={width}
                statAll={statAll} statTask={statTask}/>);
        };
        const push = (taskType: TaskType, tag: Tag) => {
            const width = stats.all[taskType][tag].reduce((s,b) => s + b);
            const task = stats.task[taskType][tag].reduce((s,b) => s + b);
            result.push(<Stat onTitleClick={() => startStudy(taskType, tag)}
                onItemClick={(blevel) => startStudy(taskType, tag, blevel)}
                title={`${TaskTypeName[taskType]}-${TagName[tag]} - ${task}|${width}`} width={width}
                statAll={iStatToIBStat(stats.all[taskType][tag])}
                statTask={iStatToIBStat(stats.task[taskType][tag])} />)
        };
        for (const taskType of TaskTypes) push1(taskType);
        for (const tag of signals.setting.value.readBooks) push('R', tag);
        for (const tag of signals.setting.peek().listenBooks) push('L', tag);
        return result;
    }
    return <>
        <div class="shrink-0 px-2 w-[env(titlebar-area-width,100%)] ml-[env(titlebar-area-x,0)] h-[env(titlebar-area-height,38px)] [app-region:drag] bg-slate-300 dark:bg-slate-900 flex justify-center items-center font-bold">学习进度</div>
        <div class="grow overflow-y-auto"><div class="p-2 flex flex-wrap justify-between gap-4">{getResult()}</div></div>
    </>;
}