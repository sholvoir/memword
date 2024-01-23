import { Tag } from "vocabulary/tag.ts";
import { TaskType } from "./itask.ts";

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