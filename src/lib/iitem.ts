import type { IDict } from "@sholvoir/dict-server/src/lib/imic.ts";
import type { ITask } from "#srv/lib/itask.ts";
import type { ITrace } from "#srv/lib/itrace.ts";

export const TASK_MAX_LEVEL = 17;
const TASK_MAX_NEXT = 2000000000000;

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

export const item2task = ({ word, last, next, level }: IItem): ITask => ({
   word,
   last,
   next,
   level,
});

export const itemMergeTrace = (item: IItem, trace: ITrace) => {
   item.last = trace.last;
   item.next = trace.next;
   item.level = trace.level;
   return item;
};

export const itemMergeDict = (item: IItem, dict: IDict) => {
   if (item.word !== dict.word) throw Error("Can not merge!");
   item.entries = dict.entries;
   if (dict.version !== undefined) item.version = dict.version;
   return item;
};

export const studyTask = (task: ITask, level?: number): ITask => {
   if (level === undefined) level = ++task.level;
   if (level > TASK_MAX_LEVEL) task.level = level = TASK_MAX_LEVEL;
   if (level <= 0) task.level = level = 1;
   const now = Date.now();
   task.last = now;
   task.next =
      level >= TASK_MAX_LEVEL
         ? TASK_MAX_NEXT
         : now + Math.round(11723 * level ** 3 * 1.5 ** level);
   return task;
};
