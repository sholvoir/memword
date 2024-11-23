// deno-lint-ignore-file no-explicit-any
import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, IStats } from "./istat.ts";
import { Signal } from "@preact/signals";
import { IMessage } from "./imessage.ts";
import { ISetting } from "./isetting.ts";
import { ITask } from "./itask.ts";
import { getEpisode, getVocabulary, setSetting, setStats } from "./mem.ts";

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
    const res = await getEpisode(signals.setting.value.sprint, tag, blevel);
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
    if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register('/service-worker.js');
        navigator.serviceWorker.onmessage = (e: MessageEvent<IMessage>) => {
            switch (e.data.type) {
                case 'setting': e.data.data.version > signals.setting.value.version && setSetting(signals.setting.value = e.data.data); break;
                case 'stats': setStats(signals.stats.value = e.data.data); break;
            }
        }
    }
    const res = await getVocabulary();
    if (res.ok) signals.vocabulary.value = await res.json();
};