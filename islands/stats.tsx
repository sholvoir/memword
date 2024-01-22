import { Signal } from "@preact/signals";
import { Tag, TagName, Tags } from "vocabulary/tag.ts";
import { BLevel, BLevels, Stats } from "../lib/istat.ts";
import { TaskType, TaskTypeName, TaskTypes } from "../lib/itask.ts";
import { ISetting } from '../lib/isetting.ts';

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
            result.push(<table>
                <colgroup>
                    <col class="pr-1"/>
                    <col class="w-full" />
                    <col class="pl-1"/>
                </colgroup>
                <thead>
                    <tr><th colspan={3}>
                        <a class="hover:cursor-pointer hover:underline" onClick={() => onClickStatBar(taskType, tag)}>{TaskTypeName[taskType]}-{TagName[tag]} - {all}</a>
                    </th></tr>
                </thead>
                <tbody>
                    {BLevels.map(blevel => {
                        const value = stat.all[blevel];
                        const task = stat.task[blevel];
                        return <tr>
                            <td class="text-left">{blevel}</td>
                            <td onClick={(ev: Event) => (ev.stopPropagation(), onClickStatBar(taskType, tag, blevel))}>
                                <div class="bg-gray-300 h-4 w-full hover:cursor-pointer">
                                    <div class="h-full bg-gray-500" style={`width: ${value * 100 / all}%`}>
                                        <div class="h-full bg-red-400" style={`width: ${value ? (task * 100 / value) : 0}%`}/>
                                    </div>
                                </div>
                            </td>
                            <td class="text-right">{task}|{value}</td>
                        </tr>
                    })}
                </tbody>
            </table>);
        }
    }
    return <div class="flex flex-wrap justify-between gap-4 [&>table]:min-w-60 [&>table]:grow">{result}</div>;
}