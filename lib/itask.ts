// deno-lint-ignore-file no-explicit-any

// last    mean
//   0    never(not in)
//   L    normal
export interface ITask {
    _id?: any;
    word: string;
    last: number;
    next: number;
    level: number;
}

export const isNever = (task: ITask) => task.last === 0;