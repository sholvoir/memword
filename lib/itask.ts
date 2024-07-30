// deno-lint-ignore-file no-explicit-any
export const MAX_NEXT = 2000000000;
export const TASK_TYPES = ['L', 'R'] as const;
export type TaskType = typeof TASK_TYPES[number];

// last    next     mean
//   0       0      reserved
//   0       M      never(not in)
//   L       0      never(task)
//   L       L      normal
//   L       M      finished
//   M      any     should deleted
export interface ITask {
    _id?: any;
    type: TaskType;
    word: string;
    last: number;
    next: number;
    level: number;
}

export const newTask = (type: TaskType, word: string): ITask => ({ type, word, last: 0, next: MAX_NEXT, level: 0 });
export const letNever = (task: ITask, time: number) => { task.last = time; task.next = 0; };
export const letDelete = (task: ITask) => { task.last = MAX_NEXT; };
export const shouldDelete = (task: ITask) => task.last == MAX_NEXT;

export const TaskTypeName: Record<TaskType, string> = {
    L: '听力',
    R: '阅读'
};