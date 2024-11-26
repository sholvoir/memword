import Cookies from "js-cookie";
import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, IStats, initStats, statsFormat } from './istat.ts';
import { requestInit } from '@sholvoir/generic/http';
import { JWT } from '@sholvoir/generic/jwt';
import { ITask } from "./itask.ts";
import { ISetting, defaultSetting, settingFormat } from "./isetting.ts";

export const getUser = () => {
    const token = Cookies.get('auth');
    return token ? (JWT.decode(token)[1].aud as string) : '';
};

export const setSetting = (setting: ISetting) => localStorage.setItem('_setting', JSON.stringify(setting));
export const getSetting = () => {
    const result = localStorage.getItem('_setting');
    if (result) {
        const setting = JSON.parse(result) as ISetting;
        if (setting.format == settingFormat) return setting;
    }
    return defaultSetting();
};

export const setStats = (stats: IStats) => localStorage.setItem('_stats', JSON.stringify(stats));
export const getStats = () => {
    const result = localStorage.getItem('_stats');
    if (result) {
        const stats = JSON.parse(result) as IStats;
        if (stats.format == statsFormat) return stats;
    }
    return initStats();
};

export const getEpisode = (sprint: number, tag?: Tag, blevel?: BLevel) => {
    const url = new URL('/wkr/episode', location.href);
    url.searchParams.append('sprint', `${sprint}`);
    if (tag) url.searchParams.append('tag', tag);
    if (blevel) url.searchParams.append('blevel', blevel);
    return fetch(url);
};

export const getDict = (word: string, reload?: true) => {
    const url = new URL('/wkr/dict', location.href);
    url.searchParams.append('word', word);
    if (reload) url.searchParams.append('reload', '1');
    return fetch(url);
};

export const cacheDict = () => fetch('/wkr/cache');
export const syncSetting = (setting: ISetting) => fetch('/wkr/setting', requestInit(setting));
export const addTasks = (tag: Tag) => fetch(`/wkr/add?tag=${encodeURIComponent(tag)}`);
export const deleteTask = (task: ITask) => fetch(`/wkr/delete?word=${task.word}`);
export const syncTasks = () => fetch('/wkr/sync');
export const study = (otask: ITask) => fetch(`/wkr/study?word=${otask.word}&level=${otask.level}`);
export const submitIssue = (issue: string) => fetch(`/wkr/issue`, requestInit({issue}));
export const search = (text: string) => fetch(`/wkr/search?word=${encodeURIComponent(text)}`);
export const updateStats = () => fetch('/wkr/update');
export const getVocabulary = () => fetch('/wkr/vocabulary');
export const logout = (cleanCache: boolean) => (localStorage.clear(), Cookies.remove('auth'), fetch(`/wkr/logout${cleanCache?'?cleanCache=1':''}`));

export const signup = (email: string) => fetch(`/signup?email=${encodeURIComponent(email)}`);
export const login = (email: string, password: string) => fetch('/login', requestInit({ email, password }));