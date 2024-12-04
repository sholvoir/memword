// deno-lint-ignore-file no-explicit-any
export const MAX_NEXT = 2000000000;

// last    mean
//   0    never(not in)
//   L    normal
//   M    should deleted
export interface ITask {
    _id?: any;
    word: string;
    last: number;
    next: number;
    level: number;
}

export const neverTask = (word: string): ITask => ({ word, last: 0, next: MAX_NEXT, level: 0 });
export const isNever = (task: ITask) => task.last === 0;
export const newTask = (word: string, time: number): ITask => ({word, last: time, next: 0, level: 0});
export const letDelete = (task: ITask) => { task.last = MAX_NEXT; };
export const shouldDelete = (task: ITask) => task.last === MAX_NEXT;