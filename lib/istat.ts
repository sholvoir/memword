import { Tag, Tags } from "vocabulary/tag.ts";
import { TaskType, TaskTypes } from "./itask.ts";

export const BLevels = ['never','start','medium','familiar','skilled','finished'] as const;
export type BLevel = typeof BLevels[number];

export const BLevelName: Record<BLevel, string> = {
    never: '未学',
    start: '新学',
    medium: '中等',
    familiar: '熟悉',
    skilled: '熟练',
    finished: '完成'
}

export interface IStat {
    all: Record<BLevel, number>;
    task: Record<BLevel, number>;
}

export type Stats = Record<TaskType, Record<Tag, IStat>>;

export const totalTask = (stats: Stats) => {
    let s = 0;
    for (const type of TaskTypes) for (const tag of Tags) for (const blevel of BLevels)
        s += stats[type][tag].task[blevel];
    return s;
}