// deno-lint-ignore-file no-explicit-any
import { Signal } from "@preact/signals";
import { ISetting } from "./isetting.ts";
import { IStats } from "./istat.ts";
import { ITask } from "./itask.ts";


export type Dial = 'about'|'start'|'stats'|'dict'|'tasks'|'menu'|'help'|'wait'|'start'|'issue'|'study'|'setting'|'login'|'logout';
export interface IDialog { dial: Dial, [key: string]: any }
export const signals = {} as {
    user: Signal<string>;
    setting: Signal<ISetting>;
    dialogs: Signal<Array<IDialog>>;
    stats: Signal<IStats>;
    tips: Signal<string>;
    tasks: Signal<Array<ITask>>;
    isPhaseAnswer: Signal<boolean>;
};
export const closeDialog = () => signals.dialogs.value = signals.dialogs.value.slice(0, -1);
export const showDialog = (d: IDialog) => signals.dialogs.value = [...signals.dialogs.value, d];
export const hideTips = () => signals.tips.value = '';
export const showTips = (content: string, autohide = true) => {
    signals.tips.value = content;
    if (autohide) setTimeout(hideTips, 3000)
};