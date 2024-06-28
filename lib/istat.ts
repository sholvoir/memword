import { Tag, Tags } from "vocabulary/tag.ts";
import { ITask, TaskType, TaskTypes } from "./itask.ts";

export const statsFormat = '0.0.3';
export const BLevels = ['never','start','medium','familiar','skilled','finished'] as const;
export type BLevel = typeof BLevels[number];
export type IBStat = Record<BLevel, number>;
export type IStat = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

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

export interface IStats {
    format: string;
    time: number;
    allT: Record<TaskType, IStat>;
    taskT: Record<TaskType, IStat>;
    all: Record<TaskType, Record<Tag, IStat>>;
    task: Record<TaskType, Record<Tag, IStat>>;
}

export const totalTask = (stats: IStats) => {
    let s = 0;
    for (const type of TaskTypes) for (const tag of Tags) for (let i = 0; i < 16; i++)
        s += stats.task[type][tag][i];
    return s;
}

export const initStats = (time = 0) => {
    const stats = { format: statsFormat, time, allT: {}, taskT: {}, all: {}, task: {} } as IStats;
    for (const taskType of TaskTypes) {
        stats.allT[taskType] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        stats.taskT[taskType] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        stats.all[taskType] = {} as Record<Tag, IStat>;
        stats.task[taskType] = {} as Record<Tag, IStat>;
        for (const tag of Tags) {
            stats.all[taskType][tag] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            stats.task[taskType][tag] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        }
    }
    return stats;
};

export const addTaskToStats = (task: ITask, stats: IStats, tags?: Array<Tag>) => {
    stats.allT[task.type][task.level]++;
    if (task.next < stats.time) stats.taskT[task.type][task.level]++;
    if (tags) for (const tag of tags) {
        stats.all[task.type][tag][task.level]++;
        if (task.next < stats.time) stats.task[task.type][tag][task.level]++;
    }
};

export const removeTaskFromStats = (task: ITask, stats: IStats, tags?: Array<Tag>) => {
    stats.allT[task.type][task.level]--;
    if (task.next < stats.time) stats.taskT[task.type][task.level]--;
    if (tags) for (const tag of tags) {
        stats.all[task.type][tag][task.level]--;
        if (task.next < stats.time) stats.task[task.type][tag][task.level]--;
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