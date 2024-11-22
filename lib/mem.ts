import Cookies from "js-cookie";
import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, IStats, initStats, statsFormat } from './istat.ts';
import { requestInit } from '@sholvoir/generic/http';
import { JWT } from '@sholvoir/generic/jwt';
import { ITask } from "./itask.ts";
import { IDiction } from "./idict.ts";
import { IMessage } from "./imessage.ts";
import { ISetting, defaultSetting, settingFormat } from "./isetting.ts";
import { closeDialog, showDialog, showTips, signals } from "./signals.ts";

export const getUser = () => {
    const token = Cookies.get('auth');
    return token ? (JWT.decode(token)[1].aud as string) : '';
};

export const startStudy = async (tag?: Tag, blevel?: BLevel) => {
    showDialog({dial: 'wait', prompt: '请稍候...'});
    const tasks = await getEpisode(tag, blevel);
    closeDialog();
    if (!tasks) {
        showTips('Network Error!');
    } else if (!tasks.length) {
        showTips('Congratulations! There are no more task need to do.');
        if (!tag && !blevel) showDialog({ dial: 'start' });
    } else {
        signals.tasks.value = tasks;
        signals.isPhaseAnswer.value = false;
        showDialog({ dial: 'study' });
    }
};

export const g = { vocabulary: [] } as { vocabulary: Array<string> };

export const setSetting = (setting: ISetting) => localStorage.setItem('_setting', JSON.stringify(setting));
export const getSetting = () => {
    const result = localStorage.getItem('_setting');
    if (result) {
        const setting = JSON.parse(result) as ISetting;
        if (setting.format == settingFormat) return setting;
    }
    return defaultSetting();
};

const setStats = (stats: IStats) => localStorage.setItem('_stats', JSON.stringify(stats));
export const getStats = () => {
    const result = localStorage.getItem('_stats');
    if (result) {
        const stats = JSON.parse(result) as IStats;
        if (stats.format == statsFormat) return stats;
    }
    return initStats();
};

export const addTasks = (tag: Tag) => fetch(`/add?tag=${encodeURIComponent(tag)}`);
export const syncTasks = () => fetch('/sync');
export const study = (otask: ITask) => fetch('/study', requestInit(otask));
export const putSetting = (setting: ISetting) => fetch('/setting', requestInit(setting));
export const signup = (email: string) => fetch(`/signup?email=${encodeURIComponent(email)}`);
export const login = (email: string, password: string) => fetch('/login', requestInit({ email, password }));
export const submitIssue = (issue: string) => fetch(`/issue`, requestInit({issue}));
export const deleteTask = (task: ITask) => fetch('delete', requestInit(task));
export const search = (text: string) => fetch(`/search?word=${encodeURIComponent(text)}`);
export const updateStats = () => fetch('/update');
const logout = (cleanCache: boolean) => fetch(`/logout${cleanCache?'?cleanCache=1':''}`);

const getEpisode = async (tag?: Tag, blevel?: BLevel) => {
    const url = new URL('/episode', location.href);
    url.searchParams.append('sprint', `${signals.setting.value.sprint}`);
    if (tag) url.searchParams.append('tag', tag);
    if (blevel) url.searchParams.append('blevel', blevel);
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json() as Array<ITask>;
};

export const getDict = async (word: string, reload?: true) => {
    const url = new URL('/dict', location.href);
    url.searchParams.append('word', word);
    if (reload) url.searchParams.append('reload', '1');
    const res = await fetch(url);
    if (!res.ok) return undefined;
    return await res.json() as IDiction;
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
    if (!signals.user.value) return showDialog({dial: 'about'});
    const res2 = await fetch('/vocabulary');
    if (res2.ok) g.vocabulary = await res2.json();
};

export const signout = async (cleanCache: boolean) => {
    localStorage.clear();
    await logout(cleanCache);
    Cookies.remove('auth');
};