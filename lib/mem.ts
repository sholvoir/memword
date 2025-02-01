import Cookies from "js-cookie";
import { IStat, initStat, statsFormat } from './istat.ts';
import { requestInit } from '@sholvoir/generic/http';
import { JWT } from '@sholvoir/generic/jwt';
import { ISetting } from "./isetting.ts";

export const getUser = () => {
    const token = Cookies.get('auth');
    return token ? (JWT.decode(token)[1].aud as string) : '';
};

export const setStats = (stats: IStat) => localStorage.setItem('_stats', JSON.stringify(stats));
export const getStats = () => {
    const result = localStorage.getItem('_stats');
    if (result) {
        const stats = JSON.parse(result) as IStat;
        if (stats.format == statsFormat) return stats;
    }
    return initStat();
};

export const getEpisode = (wordListId?: string, blevel?: number) => {
    const url = new URL('/wkr/get-episode', location.href);
    if (wordListId) url.searchParams.append('wordListid', wordListId);
    if (blevel) url.searchParams.append('blevel', `${blevel}`);
    return fetch(url);
};

export const updateDict = (word: string) => fetch(`/wkr/update-dict?word=${encodeURIComponent(word)}`);
export const getWorkerVersion = () => fetch('/wkr/version');
export const cacheDict = () => fetch('/wkr/cache-dict');
export const addTasks = (user: string, name: string) =>
    fetch(`/wkr/add-tasks?user=${encodeURIComponent(user)}&name=${encodeURIComponent(name)}`);
export const syncTasks = () => fetch('/wkr/sync-tasks');
export const downTasks = () => fetch('/wkr/down-tasks');
export const studied = (word: string, level: number) => fetch(`/wkr/studied?word=${word}&level=${level}`);
export const submitIssue = (issue: string) => fetch(`/wkr/submit-issue`, requestInit({issue}));
export const search = (text: string) => fetch(`/wkr/search?word=${encodeURIComponent(text)}`);
export const totalStats = () => fetch('/wkr/get-stats');
export const getVocabulary = () => fetch('/wkr/get-vocabulary');
export const updateVocabulary = () => fetch('/wkr/update-vocabulary');
export const logout = () => (localStorage.clear(), Cookies.remove('auth'), fetch('/wkr/logout'));

export const getSetting = () => fetch('/wkr/setting');
export const setSetting = (setting: ISetting) => fetch('/wkr/setting', requestInit(setting));
export const signup = (email: string) => fetch(`/signup?email=${encodeURIComponent(email)}`);
export const login = (email: string, password: string) => fetch('/login', requestInit({ email, password }));