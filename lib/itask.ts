// deno-lint-ignore-file no-explicit-any
export const MAX_NEXT = 2000000000;
export const TaskTypes = ['L', 'R'] as const;
export type TaskType = typeof TaskTypes[number];

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

export const TaskTypeName: Record<TaskType, string> = {
    L: '听力',
    R: '阅读'
};