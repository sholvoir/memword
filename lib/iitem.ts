import { type Tag } from "@sholvoir/vocabulary";
import { IDict } from "@sholvoir/dict/lib/idict.ts";
import { ITask } from './itask.ts'

export const MAX_NEXT = 2000000000;

export interface IItem extends IDict, ITask {
    dversion: number;
    tags: Array<Tag>
}

export const neverItem = (word: string, tags: Array<Tag>): IItem =>
    ({ word, last: 0, next: MAX_NEXT, level: 0, dversion: 0, tags });

export const item2task = ({word, last, next, level}: IItem): ITask => ({word, last, next, level});

export const itemMergeTask = (item: IItem, task: ITask) => {
    item.last = task.last;
    item.next = task.next;
    item.level = task.level
};

export const itemMergeDict = (item: IItem, dict: IDict) => {
    item.def = dict.def;
    item.pic = dict.pic;
    item.trans = dict.trans;
    item.sound = dict.sound;
    item.phonetic = dict.phonetic;
}