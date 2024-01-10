import { Tag } from "vocabulary/tag.ts";
import { TaskType } from "./itask.ts";

export const BLevels = ['never','start','medium','familiar','skilled','finished'] as const;
export type BLevel = typeof BLevels[number];

export interface IStat {
    all: Record<BLevel, number>;
    task: Record<BLevel, number>;
}

export type Stats = Record<TaskType, Record<Tag, IStat>>;