import { now } from "./common.ts";
import { ITask } from "./itask.ts";

export const statsFormat = '0.2.0';

export type TAggr = [number, number, number, number, number, number, number,
    number, number, number, number, number, number, number, number, number];
const newAggr = (): TAggr => [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

export interface IStat {
    format: string;
    time: number;
    total: TAggr;
    task: TAggr;
    wlid?: string;
    disc?: string;
}
export const initStat = (): IStat => ({
    format: statsFormat,
    time: now(),
    total: newAggr(),
    task: newAggr()
});

export const addTaskToStat = (stat: IStat, item?: ITask ) => {
    if (!item) stat.total[0]++; else {
        stat.total[item.level]++;
        if (item.next < stat.time) stat.task[item.level]++;
    }
};

export type TBAggr = [number, number, number, number, number, number];
export const BLevelName = ['未学', '新学', '中等', '熟悉', '熟练', '完成'];

export const aggrToBAggr = (aggr: TAggr): TBAggr => [
    aggr[0],
    aggr[1]+aggr[2]+aggr[3]+aggr[4]+aggr[5],
    aggr[6]+aggr[7]+aggr[8]+aggr[9],
    aggr[10]+aggr[11]+aggr[12],
    aggr[13]+aggr[14],
    aggr[15]
];

export const isBLevelIncludesLevel = (blevel: number, level: number) => {
    switch (blevel) {
        case 0: return level <= 0;
        case 1: return level >=1 && level <= 5;
        case 2: return level >= 6 && level <= 9;
        case 3: return level >= 10 && level <= 12;
        case 4: return level >= 13 && level <= 14;
        case 5: return level >= 15;
    }
};