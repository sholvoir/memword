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
    const url = new URL('/wkr/get-episode', location.href);
    url.searchParams.append('sprint', `${sprint}`);
    if (tag) url.searchParams.append('tag', tag);
    if (blevel) url.searchParams.append('blevel', blevel);
    return fetch(url);
};

export const updateDict = (word: string) => fetch(`/wkr/update-dict?word=${encodeURIComponent(word)}`);
export const getWorkerVersion = () => fetch('/wkr/version');
export const cacheDict = () => fetch('/wkr/cache-dict');
export const syncSetting = (setting: ISetting) => fetch('/wkr/sync-setting', requestInit(setting));
export const addTasks = (tag: Tag) => fetch(`/wkr/add-tasks?tag=${encodeURIComponent(tag)}`);
export const syncTasks = () => fetch('/wkr/sync-tasks');
export const study = (otask: ITask) => fetch(`/wkr/study?word=${otask.word}&level=${otask.level}`);
export const submitIssue = (issue: string) => fetch(`/wkr/submit-issue`, requestInit({issue}));
export const search = (text: string) => fetch(`/wkr/search?word=${encodeURIComponent(text)}`);
export const totalStats = () => fetch('/wkr/get-stats');
export const getVocabulary = () => fetch('/wkr/get-vocabulary');
export const logout = () => (localStorage.clear(), Cookies.remove('auth'), fetch('/wkr/logout'));

export const signup = (email: string) => fetch(`/signup?email=${encodeURIComponent(email)}`);
export const login = (email: string, password: string) => fetch('/login', requestInit({ email, password }));