// deno-lint-ignore-file no-explicit-any no-cond-assign
import { Signal } from "@preact/signals";
import { type HTTPMethod } from '@sholvoir/generic/http-method';
import { JWT } from '@sholvoir/generic/jwt';
import Cookies from "js-cookie";
import { BLevel, IStats, bLevelIncludes, totalTask, statsFormat, initStats, addTaskToStats, removeTaskFromStats } from "./istat.ts";
import { Tag } from "@sholvoir/vocabulary";
import { type ITask, TaskType, TaskTypes } from "./itask.ts";
import { ISetting, defaultSetting, settingFormat } from "./isetting.ts";
import { IDiction } from "./idict.ts";
import { IStudy } from "./istudy.ts";

const vocabularyUrl = 'https://www.micit.co/vocabulary/0.0.9/vocabulary.txt';
const revisionUrl = 'https://www.micit.co/vocabulary/0.0.9/revision.txt';
const dictApi = 'https://dict.micit.co/api';
const MAX_NEXT = 2000000000;
const dictExpire = 7 * 24 * 60 * 60;
const now = () => Math.floor(Date.now() / 1000);

export type Dial = 'about'|'start'|'stats'|'dict'|'dictm'|'tasks'|'menu'|'help'|'wait'|'start'|'issue'|'study'|'setting'|'login'|'logout';
export interface IDialog { dial: Dial, [key: string]: any }
interface GlobeSignals {
    user: Signal<string>;
    admin: Signal<boolean>;
    setting: Signal<ISetting>;
    dialogs: Signal<Array<IDialog>>;
    stats: Signal<IStats>;
    studies: Signal<Array<IStudy>>;
    tips: Signal<string>;
    syncDone: Signal<boolean>;
    isPhaseAnswer: Signal<boolean>;
}

export const signals = {} as GlobeSignals;
export const hideTips = () => signals.tips.value = '';
export const showTips = (content: string) => { signals.tips.value = content; setTimeout(hideTips, 3000) };
export const showDialog = (d: IDialog) => signals.dialogs.value = [...signals.dialogs.value, d];
export const closeDialog = () => signals.dialogs.value = signals.dialogs.value.slice(0, -1);
export const startStudy = async (taskTypes?: string, tag?: Tag, blevel?: BLevel) => {
    showDialog({dial: 'wait', prompt: '请稍候...'});
    const ts = await getEpisode(signals.setting.value.sprintNumber, taskTypes, tag, blevel);
    closeDialog();
    if (!ts.length) {
        showTips('Congratulations! There are no more task need to do.');
        if (!taskTypes && !tag && !blevel) showDialog({ dial: 'start' });
    } else {
        signals.studies.value = ts;
        signals.isPhaseAnswer.value = false;
        showDialog({ dial: 'study' });
    }
};

const fetchInit = (body: any, method: HTTPMethod = 'POST') => ({
    method,
    headers: [['Content-Type', 'application/json']],
    body: JSON.stringify(body)
}) as RequestInit;

export const signup = async (email: string) => await fetch(`/signup?email=${encodeURIComponent(email)}`);
export const login = async (email: string, password: string) => await fetch('/login', fetchInit({ email, password }));
export const submitIssue = async (issue: string) => await fetch(`/issue`, { method: 'POST', body: issue });

const vocabulary: Record<string, Array<Tag>> = {};
const revision: Record<string, string> = {};
const db = {} as { dict: IDBDatabase, user: IDBDatabase };

export const getAuth = () => Cookies.get('auth');
export const getUser = () => { const token = getAuth(); return token ? JWT.decode(token)[1].aud as string : '' };

const setVocabularyUrl = (url: string) => localStorage.setItem('_vocabulary_url', url);
const getVocabularyUrl = () => localStorage.getItem('_vocabulary_url');

export const setSetting = async (setting: ISetting) => {
    if (!setting) return;
    signals.setting.value = setting;
    localStorage.setItem('_setting', JSON.stringify(setting));
    return await fetch('/setting', fetchInit(setting, 'PUT'));
};

export const getSetting = () => {
    const result = localStorage.getItem('_setting');
    if (result) {
        const s = JSON.parse(result) as ISetting;
        if (s.format == settingFormat) return s;
    }
    return defaultSetting();
};

const openDictDB = () => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('dict', 1);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => request.result.createObjectStore('dict', { keyPath: 'word' });
});

const openUserDB = (user: string) => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(user, 1);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
        const db = request.result;
        const kvStore = db.createObjectStore('kv', { keyPath: 'key' });
        kvStore.put({ key: '_sync-time', value: 0 });
        const taskStore = db.createObjectStore('task', { keyPath: ['type', 'word'] });
        taskStore.createIndex('last', 'last');
        taskStore.createIndex('next', 'next');
    };
});

export const close = () => {
    if (updateStatsTimer) clearTimeout(updateStatsTimer);
    db.user?.close();
    db.dict?.close();
};

export const getDiction = async (word: string, refresh?: boolean): Promise<IDiction|undefined> => {
    let dict: IDiction|undefined = undefined;
    if (!refresh) {
        dict = await new Promise<IDiction>((resolve, reject) => {
            const request = db.dict.transaction('dict', 'readonly').objectStore('dict').get(word);
            request.onerror = reject;
            request.onsuccess = () => resolve(request.result);
        });
        if ((refresh === false) && dict) return dict;
    };
    if (refresh || !dict || dict.version + dictExpire < now()) {
        const resp = await fetch(`${dictApi}/${encodeURIComponent(word)}`, { cache: 'no-cache' });
        if (!resp.ok) return dict;
        dict = await resp.json() as IDiction;
        dict.word = word;
        dict.version = now();
        db.dict.transaction('dict', 'readwrite').objectStore('dict').put(dict);
    }
    return dict;
};
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
    localStorage.clear();
};

const getSyncTime = async () => await new Promise<number>((resolve, reject) => {
    const request = db.user!.transaction('kv', 'readonly').objectStore('kv').get('_sync-time');
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result.value);
});

const setSyncTime = async (time: number) => await new Promise<void>((resolve, reject) => {
    const request = db.user!.transaction('kv', 'readwrite').objectStore('kv').put({ key: '_sync-time', value: time });
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

export const getTask = (type: TaskType, word: string) => new Promise<ITask>((resolve, reject) => {
    const request = db.user!.transaction('task', 'readonly').objectStore('task').get([type, word]);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

export const putTask = (task: ITask) => new Promise<void>((resolve, reject) => {
    const request = db.user!.transaction('task', 'readwrite').objectStore('task').put(task);
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

const deleteTask = (type: TaskType, word: string) => new Promise<void>((resolve, reject) => {
    const request = db.user!.transaction('task', 'readwrite').objectStore('task').delete([type, word]);
    request.onerror = reject;
    request.onsuccess = () => resolve();
});

const getTasks = (last: number) => new Promise<Array<ITask>>((resolve, reject) => {
    const request = db.user!.transaction('task', 'readonly').objectStore('task').index('last').getAll(IDBKeyRange.lowerBound(last));
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
});

export const putTasks = (tasks: Array<ITask>) => new Promise<void>((resolve, reject) => {
    const transaction = db.user!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    for (const task of tasks) objectStore.get([task.type, task.word]).onsuccess = (e) => {
        const otask = (e.target as IDBRequest).result as ITask;
        if (!otask || task.last > otask.last) {
            objectStore.put(task);
        }
    };
});

export const addTasks = (types: TaskType[], tag: Tag) => new Promise<void>((resolve, reject) => {
    const time = now();
    const transaction = db.user!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    const stats = signals.stats.value;
    for (const type of types) for (const word in vocabulary!) {
        if (vocabulary![word]?.includes(tag)) objectStore.get([type, word]).onsuccess = (e) => {
            const task = (e.target as IDBRequest).result as ITask;
            if (!task) {
                const ntask: ITask = { type, word, last: 0, next: MAX_NEXT, level: 0 };
                const tags = vocabulary![ntask.word];
                removeTaskFromStats(ntask, stats, tags);
                ntask.last = time;
                ntask.next = 0;
                addTaskToStats(ntask, stats, tags);
                objectStore.add(ntask);
            }
        }
    }
    signals.stats.value = {...stats};
});

export const clarifyTasks = async () => {
    const needRemove = new Set<ITask>();
    await new Promise<void>((resolve, reject) => {
        const request = db.user!.transaction('task', 'readonly').objectStore('task').openCursor();
        request.onerror = reject;
        request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) return resolve();
            const task = cursor.value as ITask;
            if (task.last == 0 && task.level == 0 && task.next == MAX_NEXT) needRemove.add(task);
            if (!vocabulary![task.word]) needRemove.add(task);
            return true;
        }
    });
    for (const task of needRemove) await removeTask(task.type, task.word);
};

export const syncTasks = async () => {
    const thisTime = now();
    const lastTime = await getSyncTime();
    const otasks = await getTasks(lastTime);
    const resp = await fetch(`/task?lastgt=${lastTime}`, fetchInit(otasks));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await putTasks(ntasks);
    await setSyncTime(thisTime);
};

export const removeTask = async (type: TaskType, word: string) => {
    await deleteTask(type, word);
    await fetch(`/task?type=${encodeURIComponent(type)}&word=${encodeURIComponent(word)}`, { method: 'DELETE' });
};

export const study = ({ type, word, level }: ITask, stats: IStats) => new Promise<void>((resolve, reject) => {
    const transaction = db.user!.transaction('task', 'readwrite');
    transaction.onerror = reject;
    transaction.oncomplete = () => resolve();
    const objectStore = transaction.objectStore('task');
    objectStore.get([type, word]).onsuccess = (e) => {
        const task = (e.target as IDBRequest).result as ITask;
        if (task) {
            const tags = vocabulary![task.word];
            removeTaskFromStats(task, stats, tags);
            task.level = ++level;
            task.last = now();
            task.next = level >= 15 ? MAX_NEXT : task.last + Math.round(33 * level ** 2 * 1.82 ** level);
            objectStore.put(task);
            addTaskToStats(task, stats, tags);
        }
    }
});

export const getStats = () => {
    const result = localStorage.getItem('_stats');
    if (result) {
        const stats = JSON.parse(result) as IStats;
        if (stats.format == statsFormat) return stats;
    }
    return initStats();
};

let updateStatsTimer: number|undefined = undefined;
export const updateStats = () => new Promise<void>((resolve, reject) => {
    if (updateStatsTimer) (clearTimeout(updateStatsTimer), updateStatsTimer = undefined);
    const stats = signals.stats.value;
    const nstats: IStats = {
        format: stats.format, time: now(),
        allT: stats.allT, taskT: stats.taskT,
        all: stats.all, task: stats.task
    };
    const request = db.user!.transaction('task', 'readonly').objectStore('task')
        .index('next').openCursor(IDBKeyRange.bound(stats.time, nstats.time));
    request.onerror = reject;
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
            localStorage.setItem('_stats', JSON.stringify(nstats));
            signals.stats.value = nstats;
            updateStatsTimer = setTimeout(updateStats, 5*60*1000);
            return resolve();
        }
        const task = cursor.value as ITask;
        const tags = vocabulary![task.word];
        removeTaskFromStats(task, stats, tags);
        addTaskToStats(task, nstats, tags);
        cursor.continue();
    }
});

export const totalStats = () => new Promise<IStats>((resolve, reject) => {
    const stats = initStats(now());
    const transaction = db.user!.transaction('task', 'readonly');
    transaction.onerror = reject;
    transaction.oncomplete = () => {
        localStorage.setItem('_stats', JSON.stringify(stats));
        resolve(stats);
    }
    const objectStore = transaction.objectStore('task');
    for (const type of TaskTypes) for (const word in vocabulary!)
        objectStore.get([type, word]).onsuccess = (e) => {
            const task = (e.target as IDBRequest).result as ITask ?? { type, word, last: 0, next: MAX_NEXT, level: 0 };
            addTaskToStats(task, stats, vocabulary![task.word]);
        }
});

export const getEpisode = async (sprintNumber: number, taskTypes?: string, tag?: Tag, blevel?: BLevel) => {
    const tasks: Array<ITask> = [];
    await new Promise<void>((resolve, reject) => {
        const request = db.user!.transaction('task', 'readonly').objectStore('task')
            .index('next').openCursor(blevel == 'never' ? undefined : IDBKeyRange.upperBound(now()), "prev");
        request.onerror = reject;
        request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) return resolve();
            const task = cursor.value as ITask;
            if ((!taskTypes || taskTypes.includes(task.type))
                && (!tag || vocabulary![task.word]?.includes(tag))
                && (!blevel || bLevelIncludes(blevel, task.level)))
                tasks.push(task);
            if (tasks.length < sprintNumber) cursor.continue();
            else resolve(); 
        }
    });
    const studies: Array<IStudy> = [];
    for (const task of tasks) {
        const dict = await getDiction(task.word);
        studies.push({ ...task, ...dict } as IStudy);
    }
    return studies;
};

export const searchWord = async (word: string) => {
    if (!vocabulary?.[word]) {
        if (!revision[word]) {
            if (!vocabulary?.[word.toLowerCase()]) {
                if (!revision[word.toLowerCase()]) return undefined;
                else word = revision[word.toLowerCase()];
            } else word = word.toLowerCase();
        } else word = revision[word];
    }
    let task = await getTask('R', word);
    if (!task) {
        task = { type: 'R', word, last: 0, next: MAX_NEXT, level: 0 };
        await putTask(task);
    }
    const dict = await getDiction(task.word);
    return { ...task, ...dict } as IStudy;
};

export const init = async () => {
    const user = signals.user.peek();
    if (!user) return showDialog({dial: 'about'});
    db.dict = await openDictDB();
    db.user = await openUserDB(user);
    const res1 = await fetch('/setting');
    if (res1.ok) setSetting(await res1.json());
    const oldVocabularyUrl = getVocabularyUrl();
    if (vocabularyUrl !== oldVocabularyUrl) showDialog({ dial: 'wait', prompt: '更新本地数据...' });
    const res2 = await fetch(vocabularyUrl, { cache: 'force-cache' });
    if (res2.ok) {
        const delimiter = /[,:] */;
        for (let line of (await res2.text()).split('\n')) if (line = line.trim()) {
            const [word, ...tags] = line.split(delimiter).map(w=>w.trim());
            vocabulary[word] = tags as Array<Tag>;
        }
    }
    const res3 = await fetch(revisionUrl, { cache: 'force-cache' });
    if (res3.ok) {
        const delimiter = /: */;
        for (let line of (await res3.text()).split('\n')) if (line = line.trim()) {
            const [word, replace] = line.split(delimiter);
            revision[word] = replace;
        }
    }
    if (vocabularyUrl !== oldVocabularyUrl) clarifyTasks();
    await syncTasks();
    signals.stats.value = await totalStats();
    if (vocabularyUrl !== oldVocabularyUrl) { setVocabularyUrl(vocabularyUrl); closeDialog(); }
    if (signals.setting.value.showStartPage && totalTask(signals.stats.value) == 0) showDialog({ dial: 'start' });
    signals.syncDone.value = true;
};
