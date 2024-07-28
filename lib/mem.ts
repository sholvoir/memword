// deno-lint-ignore-file no-explicit-any
import Cookies from "js-cookie";
import { Signal } from "@preact/signals";
import { JWT } from '@sholvoir/generic/jwt';
import { requestInit } from "@sholvoir/generic/http";
import { Tag } from "@sholvoir/vocabulary";
import { BLevel, IStats } from "./istat.ts";
import { ISetting} from "./isetting.ts";
import { IMessage } from "./imessage.ts";
import { ITask } from "./itask.ts";

export type Dial = 'about'|'start'|'stats'|'dict'|'tasks'|'menu'|'help'|'wait'|'start'|'issue'|'study'|'setting'|'login'|'logout';
export interface IDialog { dial: Dial, [key: string]: any }
interface GlobeSignals {
    user: Signal<string>;
    setting: Signal<ISetting>;
    dialogs: Signal<Array<IDialog>>;
    stats: Signal<IStats>;
    tips: Signal<string>;
    tasks: Signal<Array<ITask>>;
    isPhaseAnswer: Signal<boolean>;
}

export const g = {} as { sw: ServiceWorker};
export const signals = {} as GlobeSignals;
export const hideTips = () => signals.tips.value = '';
export const showTips = (content: string) => { signals.tips.value = content; setTimeout(hideTips, 3000) };
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

export const signup = async (email: string) => await fetch(`/signup?email=${encodeURIComponent(email)}`);
export const login = async (email: string, password: string) => await fetch('/login', requestInit({ email, password }));
export const submitIssue = async (issue: string) => await fetch(`/issue`, { method: 'POST', body: issue });

export const getAuth = () => Cookies.get('auth');
export const getUser = () => { const token = getAuth(); return token ? JWT.decode(token)[1].aud as string : '' };

export const removeAuth = async (cleanUser: boolean, cleanDict: boolean) => {
    close();
    if (cleanDict) await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase('dict');
        request.onerror = reject;
        request.onsuccess = resolve;
    });
    if (cleanUser) await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(signals.user.peek());
        request.onerror = reject;
        request.onsuccess = resolve;
    });
    signals.user.value = '';
    Cookies.remove('auth');
};

const getEpisode = async (types?: string, tag?: Tag, blevel?: BLevel) => {
    const params = new URLSearchParams();
    if (types) params.append('types', types);
    if (tag) params.append('tag', tag);
    if (blevel) params.append('blevel', blevel);
    const p = params.toString();
    const req = await fetch(`/episode${p?`?p`:''}`);
    if (req.ok) return await req.json() as Array<ITask>;
}

let sw: ServiceWorker | null = null;
export const close = () => sw?.postMessage({type: 'close'});

export const init = async () => {
    const user = signals.user.peek();
    if (!user) return showDialog({dial: 'about'});
    const reg = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
    navigator.serviceWorker.onmessage = (e: MessageEvent<IMessage>) => {
        switch (e.data.type) {
            case 'setting': signals.setting.value = e.data.data; break;
            case 'stats': signals.stats.value = e.data.data; break;
        }
    };
    const x = () => {
        if (!sw) {
            sw = reg.active;
            sw?.postMessage({ type: 'init', data: { user } });
        }
    }
    if (reg.installing) reg.installing.onstatechange = x;
    else if (reg.waiting) reg.waiting.onstatechange = x;
    else if (reg.active) x();    
};