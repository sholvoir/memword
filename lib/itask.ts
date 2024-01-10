export const TaskTypes = ['L', 'R'] as const;
export type TaskType = typeof TaskTypes[number];

export interface ITask {
    type: TaskType;
    word: string;
    last: number;
    next: number;
    level: number;
}

export const TaskTypeName: Record<TaskType, string> = {
    'L': 'Listen',
    'R': 'Read'
};