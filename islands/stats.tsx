import { Signal } from "@preact/signals";
import { Tag, Tags } from "vocabulary/tag.ts";
import { TagName } from '../lib/tag.ts';
import { BLevel, BLevelName, BLevels, Stats } from "../lib/istat.ts";
import { TaskType, TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { ISetting } from '../lib/isetting.ts';
import Tab from './tab.tsx';

interface IStatsProps {
    setting: Signal<ISetting>;
    stats: Signal<Stats>;
    onClickStatBar: (taskType?: TaskType, tag?: Tag, blevel?: BLevel) => void;
};

export default ({ setting, stats, onClickStatBar}: IStatsProps) => {
    const result = [];
    for (const taskType of TaskTypes) for (const tag of Tags) {
        const stat = stats.value[taskType][tag];
        const all = BLevels.reduce((s,b) => s + stat.all[b], 0);
        if (setting.value.wordBooks[`${taskType}${tag}`]) {
            result.push(<div class="grow grid gap-x-1 grid-cols-[max-content_1fr_max-content] items-center">
                <div class="col-span-3 text-center font-bold">
                    <a class="hover:cursor-pointer hover:underline" onClick={() => onClickStatBar(taskType, tag)}>{TaskTypeName[taskType]}-{TagName[tag]} - {all}</a>
                </div>
                {BLevels.map(blevel => {
                    const value = stat.all[blevel];
                    const task = stat.task[blevel];
                    return <>
                        <div class="text-left">{BLevelName[blevel]}</div>
                        <div onClick={(ev: Event) => (ev.stopPropagation(), onClickStatBar(taskType, tag, blevel))}>
                            <div class="bg-gray-300 h-3 w-full hover:cursor-pointer">
                                <div class="h-full bg-gray-500" style={`width: ${value * 100 / all}%`}>
                                    <div class="h-full bg-red-400" style={`width: ${value ? (task * 100 / value) : 0}%`}/>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">{task}|{value}</div>
                    </>
                })}
            </div>);
        }
    }
    return <Tab title="学习进度">
        <div class="flex flex-wrap justify-between gap-5 overflow-y-auto">{result}</div>;
    </Tab>
}