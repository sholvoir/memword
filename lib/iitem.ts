import { IDict } from "./idict.ts";
import { ITask } from './itask.ts';

export const MAX_NEXT = 2000000000;

export interface IItem extends IDict, ITask {
    dversion?: number;
}

export const neverItem = (word: string, time: number): IItem =>
    ({ word, last: time, next: time, level: 0 });

export const item2task = ({word, last, next, level}: IItem): ITask => ({word, last, next, level});

export const itemMergeTask = (item: IItem, task: ITask) => {
    item.last = task.last;
    item.next = task.next;
    item.level = task.level;
    return item;
};

export const itemMergeDict = (item: IItem, dict: IDict) => {
    item.def = dict.def;
    item.trans = dict.trans;
    item.sound = dict.sound;
    item.phonetic = dict.phonetic;
    return item;
}