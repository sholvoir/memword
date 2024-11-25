// deno-lint-ignore-file no-explicit-any
import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, IStats } from "./istat.ts";
import { Signal } from "@preact/signals";
import { ISetting } from "./isetting.ts";
import { ITask } from "./itask.ts";
import * as mem from "./mem.ts";
import denoConfig from "../deno.json" with { type: "json" };

export const version = denoConfig.version;
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
    vocabulary: Signal<Array<string>>;
};
export const closeDialog = () => signals.dialogs.value = signals.dialogs.value.slice(0, -1);
export const showDialog = (d: IDialog) => signals.dialogs.value = [...signals.dialogs.value, d];
export const hideTips = () => signals.tips.value = '';
export const showTips = (content: string, autohide = true) => {
    signals.tips.value = content;
    if (autohide) setTimeout(hideTips, 3000)
};

export const startStudy = async (tag?: Tag, blevel?: BLevel) => {
    const res = await mem.getEpisode(signals.setting.value.sprint, tag, blevel);
    if (!res.ok) return showTips('Network Error!');
    const tasks = await res.json() as Array<ITask>
    if (!tasks.length) {
        showTips('Congratulations! There are no more task need to do.');
        if (!tag && !blevel) showDialog({ dial: 'start' });
    } else {
        signals.tasks.value = tasks;
        signals.isPhaseAnswer.value = false;
        showDialog({ dial: 'study' });
    }
};

export const init = async () => {
    if ("serviceWorker" in navigator)await navigator.serviceWorker.register('/service-worker.js');
    const res1 = await mem.syncSetting(signals.setting.value);
    if (res1.ok) {
        const nsetting = await res1.json() as ISetting;
        if (nsetting.version > signals.setting.value.version)
            mem.setSetting(signals.setting.value = nsetting)
    }
    const res2 = await mem.updateStats();
    if (res2.ok) mem.setStats(signals.stats.value = await res2.json());
    const res3 = await mem.getVocabulary();
    if (res3.ok) signals.vocabulary.value = await res3.json();
};