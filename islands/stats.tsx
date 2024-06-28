// deno-lint-ignore-file no-explicit-any
import { Tag, Tags } from "vocabulary/tag.ts";
import { TagName } from '../lib/tag.ts';
import { BLevel, IStat, IStats } from "../lib/istat.ts";
import { TaskType, TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { iStatToIBStat } from "../lib/istat.ts";
import { signals, startStudy } from '../lib/mem.ts';
import Stat from './stat.tsx';

export default () => {
    const getResult = () => {
        const result = [] as Array<any>;
        const stats: IStats = signals.stats.value;
        const push1 = (taskType: TaskType) => {
            const statAllSum: IStat = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            for (let i = 0; i < 16; i++) for (const tag of Tags) statAllSum[i] += stats.all[taskType][tag][i];
            const statTaskSum: IStat = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            for (let i = 0; i < 16; i++) for (const tag of Tags) statTaskSum[i] += stats.task[taskType][tag][i];
            const width = statAllSum.reduce((s,b) => s + b, 0);
            const task = statTaskSum.reduce((s,b) => s + b, 0);
            result.push(<Stat onTitleClick={() => startStudy(taskType)}
                onItemClick={(blevel: BLevel) => startStudy(taskType, undefined, blevel)} 
                title={`${TaskTypeName[taskType]} - ${task}|${width}`} width={width}
                statAll={iStatToIBStat(statAllSum)}
                statTask={iStatToIBStat(statTaskSum)}/>);
        };
        const push = (taskType: TaskType, tag: Tag) => {
            const width = stats.all[taskType][tag].reduce((s,b) => s + b, 0);
            const task = stats.task[taskType][tag].reduce((s,b) => s + b, 0);
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