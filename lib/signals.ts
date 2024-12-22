import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, IStats } from "./istat.ts";
import { Signal } from "@preact/signals";
import { ISetting } from "./isetting.ts";
import { IItem } from "./iitem.ts";
import { wait } from "@sholvoir/generic/wait";
import * as mem from "./mem.ts";
import denoConfig from "../deno.json" with { type: "json" };

export const version = denoConfig.version;
export type Dial = 'home'|'about'|'add'|'stats'|'dict'|'tasks'|'menu'|'help'|'wait'|'issue'|'study'|'setting'|'login'|'logout';
export const signals = {} as {
    user: Signal<string>;
    setting: Signal<ISetting>;
    dialogs: Signal<Array<Dial>>;
    stats: Signal<IStats>;
    tips: Signal<string>;
    vocabulary: Signal<Array<string>>;
    waitPrompt: Signal<string>;
    // study
    isPhaseAnswer: Signal<boolean>;
    item: Signal<IItem|undefined>;
    tag: Signal<Tag|undefined>;
    blevel: Signal<BLevel|undefined>;
    sprint: Signal<number>;
};
export const closeDialog = () => signals.dialogs.value = signals.dialogs.value.slice(0, -1);
export const showDialog = (d: Dial) => signals.dialogs.value = [...signals.dialogs.value, d];
export const hideTips = () => signals.tips.value = '';
export const showTips = (content: string, autohide = true) => {
    signals.tips.value = content;
    if (autohide) setTimeout(hideTips, 3000);
};

export const startStudy = async (tag?: Tag, blevel?: BLevel) => {
    signals.waitPrompt.value = '请稍后...';
    showDialog('wait');
    signals.tag.value = tag;
    signals.blevel.value = blevel;
    const res = await mem.getEpisode(signals.tag.value, signals.blevel.value);
    if (!res.ok) return showTips('Network Error!');
    closeDialog();
    const item = await res.json();
    if (item) {
        signals.item.value = item;
        signals.isPhaseAnswer.value = false;
        signals.sprint.value = 0;
        showDialog('study');
    } else {
        showTips('Congratulations! There are no more task need to do.');
        if (!tag && !blevel) showDialog('add');
    }
};

const versionCompare = async () => {
    await wait(1000);
    const res0 = await mem.getWorkerVersion();
    if (!res0.ok) return globalThis.location.reload();
    if (version != (await res0.json()).version) return globalThis.location.reload();
};

const syncSetting = async () => {
    const res1 = await mem.syncSetting(signals.setting.value);
    if (!res1.ok) return
    const ssetting: ISetting = await res1.json();
    if (ssetting && ssetting.version > signals.setting.value.version)
        mem.setSetting(signals.setting.value = ssetting);
}

export const init = async () => {
    if ("serviceWorker" in navigator) await navigator.serviceWorker.register('/service-worker.js');

    versionCompare();
    syncSetting();

    const res2 = await mem.syncTasks();
    if (!res2.ok) return globalThis.location.reload();

    const res3 = await mem.totalStats();
    if (!res3.ok) return globalThis.location.reload();
    mem.setStats(signals.stats.value = await res3.json());

    const res4 = await mem.getVocabulary();
    if (!res4.ok) return globalThis.location.reload();
    signals.vocabulary.value = await res4.json();
};