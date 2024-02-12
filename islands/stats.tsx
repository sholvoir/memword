import { Signal } from "@preact/signals";
import { Tag, Tags } from "vocabulary/tag.ts";
import { TagName } from '../lib/tag.ts';
import { BLevel, BLevelName, BLevels, IStats } from "../lib/istat.ts";
import { TaskType, TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { ISetting } from '../lib/isetting.ts';
import Tab from './tab.tsx';
import { iStatToIBStat } from "../lib/istat.ts";

interface IStatsProps {
    setting: Signal<ISetting>;
    stats: Signal<IStats>;
    onClickStatBar: (taskType?: TaskType, tag?: Tag, blevel?: BLevel) => void;
};

export default ({ setting, stats, onClickStatBar}: IStatsProps) => {
    const getResult = () => {
        const result = [];
        for (const taskType of TaskTypes) for (const tag of Tags) {
            const statAll = iStatToIBStat(stats.value.all[taskType][tag]);
            const statTask = iStatToIBStat(stats.value.task[taskType][tag])
            const all = stats.value.all[taskType][tag].reduce((s,b) => s + b, 0);
            if (setting.value.wordBooks.includes(`${taskType}${tag}`)) {
                result.push(<div class="grow min-w-80 grid gap-x-1 grid-cols-[max-content_1fr] items-center">
                    <div class="col-span-2 text-center font-bold">
                        <a class="hover:cursor-pointer hover:underline" onClick={() => onClickStatBar(taskType, tag)}>{TaskTypeName[taskType]}-{TagName[tag]} - {all}</a>
                    </div>
                    {BLevels.map(blevel => {
                        const value = statAll[blevel];
                        const task = statTask[blevel];
                        return <>
                            <div class="text-left">{BLevelName[blevel]}</div>
                            <div class="relative bg-slate-300 dark:bg-slate-700 h-6 py-1 w-full hover:cursor-pointer" onClick={(ev: Event) => (ev.stopPropagation(), onClickStatBar(taskType, tag, blevel))}>
                                <div class="my-auto h-4 bg-slate-400" style={`width: ${value * 100 / all}%`}>
                                    <div class="ml-auto h-full bg-orange-500" style={`width: ${value ? (task * 100 / value) : 0}%`}/>
                                </div>
                                <div class="absolute top-0 right-0">{task}|{value}</div>
                            </div>
                        </>
                    })}
                </div>);
            }
        }
        return result;
    }
    return <Tab title="学习进度">
        <div class="p-2 flex flex-wrap justify-between gap-4">{getResult()}</div>
    </Tab>
}