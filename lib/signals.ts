import { IStat } from "./istat.ts";
import { Signal } from "@preact/signals";
import { IItem } from "./iitem.ts";
import { wait } from "@sholvoir/generic/wait";
import * as mem from "./mem.ts";
import denoConfig from "../deno.json" with { type: "json" };

export const version = denoConfig.version;
export type TDial = 'home'|'about'|'add'|'stats'|'dict'|'tasks'|'menu'|'help'|'wait'|'issue'|'study'|'setting'|'login'|'logout';
export const signals = {} as {
    user: Signal<string>;
    dialogs: Signal<Array<TDial>>;
    stats: Signal<Array<IStat>>;
    tips: Signal<string>;
    vocabulary: Signal<Array<string>>;
    // study
    isPhaseAnswer: Signal<boolean>;
    item: Signal<IItem|undefined>;
    wlid: Signal<string|undefined>;
    blevel: Signal<number>;
    sprint: Signal<number>;
};
export const closeDialog = () => signals.dialogs.value = signals.dialogs.value.slice(0, -1);
export const showDialog = (d: TDial) => signals.dialogs.value = [...signals.dialogs.value, d];
export const hideTips = () => signals.tips.value = '';
export const showTips = (content: string, autohide = true) => {
    signals.tips.value = content;
    if (autohide) setTimeout(hideTips, 3000);
};

export const startStudy = async (tag?: string, blevel = -1) => {
    showDialog('wait');
    signals.wlid.value = tag;
    signals.blevel.value = blevel;
    const res = await mem.getEpisode(signals.wlid.value, signals.blevel.value);
    if (!res.ok) return showTips('Network Error!');
    closeDialog();
    const item: IItem = (await res.json()).item;
    if (item) {
        signals.item.value = item;
        signals.isPhaseAnswer.value = false;
        signals.sprint.value = 0;
        showDialog('study');
    } else {
        showTips('Congratulations! There are no more task need to do.');
        totalStats();
        if (!tag && !blevel) showDialog('add');
    }
};

const versionCompare = async () => {
    await wait(2000);
    const res0 = await mem.getWorkerVersion();
    if (!res0.ok) return globalThis.location.reload();
    const workerVersion = (await res0.json()).version;
    console.log(`Page Version: ${version}, Worker Version: ${workerVersion}.`);
    if (version != workerVersion) return globalThis.location.reload();
};

export const totalStats = async () => {
    const res = await mem.totalStats();
    if (res.ok) mem.setStats(signals.stats.value = await res.json());
}

export const init = async () => {
    if ("serviceWorker" in navigator) await navigator.serviceWorker.register('/service-worker.js');

    versionCompare();

    const res3 = await mem.updateVocabulary();
    if (res3.ok) {
        signals.vocabulary.value = await res3.json();
    } else {
        const res4 = await mem.getVocabulary();
        if (res4.ok) signals.vocabulary.value = await res4.json();
        else globalThis.location.reload();
    }
    const res2 = await mem.syncTasks();
    if (!res2.ok) return globalThis.location.reload();

    await totalStats();
};