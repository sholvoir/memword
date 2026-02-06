import { now } from "@sholvoir/memword-common/common";
import type { IDict } from "@sholvoir/memword-common/idict";
import type { ITask } from "@sholvoir/memword-common/itask";

export interface IItem extends IDict, ITask {
   dictSync?: number;
}

export const neverItem = (word: string, time: number): IItem => ({
   word,
   last: time,
   next: time,
   level: 0,
});

export const newItem = (dict: IDict): IItem => {
   const time = now();
   return {
      word: dict.word,
      entries: dict.entries,
      version: dict.version,
      level: 0,
      last: time,
      next: time,
      dictSync: time,
   };
};

export const item2task = ({ word, last, next, level }: IItem): ITask => ({
   word,
   last,
   next,
   level,
});

export const itemMergeTask = (item: IItem, task: ITask) => {
   item.last = task.last;
   item.next = task.next;
   item.level = task.level;
   return item;
};

export const itemMergeDict = (item: IItem, dict: IDict) => {
   if (item.word !== dict.word) throw Error("Can not merge!");
   item.entries = dict.entries;
   if (dict.version !== undefined) item.version = dict.version;
   return item;
};
