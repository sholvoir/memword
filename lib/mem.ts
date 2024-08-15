// deno-lint-ignore-file no-explicit-any
import Cookies from "js-cookie";
import { Signal } from "@preact/signals";
import { JWT } from '@sholvoir/generic/jwt';
import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, IStats } from "./istat.ts";
import { ISetting} from "./isetting.ts";
import { ITask } from "./itask.ts";
import { getEpisode, worker } from './worker.ts';

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
}
export const hideTips = () => signals.tips.value = '';
export const showTips = (content: string, autohide = true) => {
    signals.tips.value = content;
    if (autohide) setTimeout(hideTips, 3000)
};
export const showDialog = (d: IDialog) => signals.dialogs.value = [...signals.dialogs.value, d];
export const closeDialog = () => signals.dialogs.value = signals.dialogs.value.slice(0, -1);

export const startStudy = async (types?: string, tag?: Tag, blevel?: BLevel) => {
    showDialog({dial: 'wait', prompt: '请稍候...'});
    const tasks = await getEpisode(types, tag, blevel);
    closeDialog();
    if (!tasks || !tasks.length) {
        showTips('Congratulations! There are no more task need to do.');
        if (!types && !tag && !blevel) showDialog({ dial: 'start' });
    } else {
        signals.tasks.value = tasks;
        signals.isPhaseAnswer.value = false;
        showDialog({ dial: 'study' });
    }
};

export const getUser = () => {
    const token = Cookies.get('auth');
    return token ? (JWT.decode(token)[1].aud as string) : '';
};

export const init = () => {
    const user = signals.user.value;
    if (!user) return showDialog({dial: 'about'});
    worker.onSettingChanged = (setting) => signals.setting.value = setting;
    worker.onStatsChanged = (stats) => signals.stats.value = stats;
    worker.init(user);
};

export const close = worker.close;

export const logout = (cleanUser: boolean, cleanDict: boolean) => {
    worker.logout(cleanUser, cleanDict);
    Cookies.remove('auth');
}