import type { ITask } from "@sholvoir/memword-server/src/lib/itask.ts";
import { TASK_MAX_NEXT } from "./common.ts";
import type { IDict } from "./idict.ts";
import type { ITrace } from "./itrace.ts";

export type { ITask };
export const TASK_MAX_LEVEL = 17;

export interface IItem extends IDict, ITask {
   dictSync?: number;
}

export const neverItem = (word: string, time: number): IItem => ({
   word,
   last: time,
   next: time,
   level: 0,
   entries: [],
});

export const newItem = (dict: IDict): IItem => {
   const time = Date.now();
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

export const toTask = <T extends ITask>({
   word,
   last,
   next,
   level,
}: T): ITask => ({
   word,
   last,
   next,
   level,
});

export const itemMergeDict = (item: IItem, dict: IDict) => {
   if (item.word !== dict.word) throw Error("Can not merge!");
   item.entries = dict.entries;
   if (dict.version !== undefined) item.version = dict.version;
   return item;
};

export const studyTask = <T extends ITrace>(task: T, level?: number): T => {
   if (level === undefined) level = task.level + 1;
   if (level > TASK_MAX_LEVEL) task.level = level = TASK_MAX_LEVEL;
   else if (level <= 0) task.level = level = 1;
   else task.level = level;
   const now = Date.now();
   task.last = now;
   task.next =
      level >= TASK_MAX_LEVEL
         ? TASK_MAX_NEXT
         : now + Math.round(11723 * level ** 3 * 1.5 ** level);
   return task;
};
