import { Tag, Tags } from "@sholvoir/vocabulary";
import { isNever } from "./itask.ts";
import { IItem } from "./iitem.ts";

export const statsFormat = '0.1.0';

export const BLevels = ['never','start','medium','familiar','skilled','finished'] as const;
export type BLevel = typeof BLevels[number];
export type IBStat = Record<BLevel, number>;
export type IStat = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
const newStat = (): IStat => [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

export interface IStats {
    format: string;
    time: number;
    all: Record<Tag, IStat>;
    task: Record<Tag, IStat>;
}

export const BLevelName: Record<BLevel, string> = {
    never: '未学',
    start: '新学',
    medium: '中等',
    familiar: '熟悉',
    skilled: '熟练',
    finished: '完成'
}

export const bLevelIncludes = (blevel: BLevel, level: number) => {
    switch (blevel) {
        case 'never': return level <= 0;
        case 'start': return level >=1 && level <= 5;
        case 'medium': return level >= 6 && level <= 9;
        case 'familiar': return level >= 10 && level <= 12;
        case 'skilled': return level >= 13 && level <= 14;
        case 'finished': return level >= 15;
    }
}

export const initStats = (time = 0) => {
    const stats = { format: statsFormat, time, all: {}, task: {} } as IStats;
    for (const tag of Tags) {
        stats.all[tag] = newStat();
        stats.task[tag] = newStat();
    }
    return stats;
};

export const addTaskToStats = (item: IItem, stats: IStats) => {
    if (!isNever(item)) {
        stats.all['__'][item.level]++;
        if (item.next < stats.time) stats.task['__'][item.level]++;
    }
    for (const tag of item.tags) {
        stats.all[tag][item.level]++;
        if (item.next < stats.time) stats.task[tag][item.level]++;
    }
};

export const iStatToIBStat = (stat: IStat): IBStat => ({
    never: stat[0],
    start: stat[1]+stat[2]+stat[3]+stat[4]+stat[5],
    medium: stat[6]+stat[7]+stat[8]+stat[9],
    familiar: stat[10]+stat[11]+stat[12],
    skilled: stat[13]+stat[14],
    finished: stat[15]
})