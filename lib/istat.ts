import { Tag, Tags } from "@sholvoir/vocabulary";
import { ITask, TaskTypes } from "./itask.ts";

export const statsFormat = '0.0.5';
export const BLevels = ['never','start','medium','familiar','skilled','finished'] as const;
export type BLevel = typeof BLevels[number];
export type IBStat = Record<BLevel, number>;
export type IStat = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
const newStat = (): IStat => [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

export interface IStats {
    format: string;
    time: number;
    all: Record<string, IStat>;
    task: Record<string, IStat>;
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
    for (const type of TaskTypes) for (const tag of Tags) {
        const k = `${type}${tag}`;
        stats.all[k] = newStat();
        stats.task[k] = newStat();
    }
    return stats;
};

export const adjTaskToStats = (task: ITask, stats: IStats, tags: Array<Tag>, direction = 0) => {
    const ttag = `${task.type}__`;
    if (task.level != 0 || task.next < stats.time) stats.all[ttag][task.level] += direction;
    if (Number.isNaN(stats.all[ttag][task.level])) console.log(task, stats, tags);
    if (task.next < stats.time) stats.task[ttag][task.level] += direction;
    for (const tag of tags) {
        const k = `${task.type}${tag}`;
        stats.all[k][task.level] += direction;
        if (task.next < stats.time) stats.task[k][task.level] += direction;
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