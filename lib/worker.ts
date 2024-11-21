// deno-lint-ignore-file no-cond-assign
/// <reference lib="webworker" />

import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, adjTaskToStats, initStats } from "./istat.ts";
import { badRequest, jsonResponse, notFound, ok, requestInit } from "@sholvoir/generic/http";
import { VOCABULARY_URL, now } from "./common.ts";
import { IDiction } from "./idict.ts";
import { IMessage } from "./imessage.ts";
import { ISetting, defaultSetting } from "./isetting.ts";
import { ITask, letDelete, MAX_NEXT, newTask } from "./itask.ts";
import {
    addIssue, addTasks, clarifyDiction, clarifyTask, clearDict, clearKv, clearTask,
    getDiction, getEpisode, getKv, getTask, getTasks, mergeTasks, putDiction, putTask,
    setKv, totalStats, updateStats, vocabulary, init as indexdbInit
} from "./indexdb.ts";

declare const self: ServiceWorkerGlobalScope;
self.oninstall = (e) => e.waitUntil(handleInstall());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));

const DICT_API = 'https://dict.micit.co/api';
const dictExpire = 7 * 24 * 60 * 60;
const cacheName = 'MemWord-V1';
const staticFiles = ['/', '/icon/icon-192.png', '/icon/icon-1024.png', '/styles.css'];
const g = { stats: initStats() };
const sendMessage = async (msg: IMessage) => {
    for (const client of await self.clients.matchAll()) client.postMessage(msg);
}

const handleInstall = async () => {
    await (await caches.open(cacheName)).addAll(staticFiles);
    await self.skipWaiting();
};

const handleActivate = async () => {
    if (self.registration.navigationPreload)
        await self.registration.navigationPreload.enable();
    for (const cacheKey of await caches.keys()) {
        if (cacheKey !== cacheName)
            await caches.delete(cacheKey)
    }
    await self.clients.claim();
};

const putInCache = async (request: Request, response: Response) => {
    await (await caches.open(cacheName)).put(request, response);
};

const handleFetch = async (request: Request) => {
    switch (new URL(request.url).pathname) {
        case '/vocabulary': return fetchVocabulary();
        case '/dict': return await fetchDict(request);
        case '/search': return await fetchSearch(request);
        case '/setting': return await putSetting(request);
        case '/episode': return await fetchEpisode(request);
        case '/update': upStats(); return ok;
        case '/delete': return await deleteTask(request);
        case '/sync': syncTasks(); return ok;
        case '/add': return fetchAdd(request);
        case '/study': await postStudy(request);return ok;
        case '/issue': return submitIssue(request);
        case '/cache': cacheDict(); return ok;
        case '/signup': return fetch(request);
        case '/login': return fetch(request);
        case '/logout': return await fetchLogout(request);
        default: {
            const responseFromCache = await caches.match(request);
            if (responseFromCache) return responseFromCache;
            const responseFromNetwork = await fetch(request);
            if (responseFromNetwork.ok)
                putInCache(request, responseFromNetwork.clone());
            return responseFromNetwork;
        }
    }
};


const fetchDiction = async (word: string) => {
    const resp1 = await fetch(`${DICT_API}/${encodeURIComponent(word)}`, { cache: 'reload' });
    if (!resp1.ok) return undefined;
    const dict: IDiction = await resp1.json();
    dict.word = word;
    dict.version = now();
    return dict;
};

const syncTasks = async (lastTime?: number) => {
    const thisTime = now();
    if (!lastTime) lastTime = (await getKv('_sync-time')) ?? 0;
    const resp = await fetch(`/task?lastgt=${lastTime}`, requestInit(await getTasks(lastTime!)));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await mergeTasks(ntasks);
    await setKv('_sync-time', thisTime);
};

const syncSetting = async (setting?: ISetting) => {
    if (!setting) setting = (await getKv('_setting')) ?? defaultSetting();
    const res = await fetch('/setting', requestInit(setting));
    if (res.ok) {
        const nsetting: ISetting = await res.json();
        if (nsetting.version > setting!.version) {
            await setKv('_setting', nsetting);
            sendMessage({ type: 'setting', data: nsetting });
        }
    }
};

const upStats = async () => await sendMessage({ type: 'stats', data: g.stats = await updateStats(g.stats) });

const cacheDict = async () => {
    for (const task of await getTasks(0)) if (task?.word) {
        const word = task.word;
        if (!await getDiction(word)) {
            const dict = await fetchDiction(word);
            if (dict) await putDiction(dict);
            else console.error(`Can not fetch word: ${word}.`)
        }
    }
};

const fetchDict = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const word = params.get('word');
    const reload = params.get('reload');
    if (!word) return badRequest;
    let dict: IDiction | undefined = undefined;
    if (reload) {
        dict = await fetchDiction(word);
        if (dict) putDiction(dict);
        else dict = await getDiction(word);
    } else {
        dict = await getDiction(word);
        if (dict) {
            if (dict.version + dictExpire < now())
                fetchDiction(word).then(d => d ? putDiction(d) : undefined);
        } else {
            dict = await fetchDiction(word);
            if (dict) putDiction(dict);
        }
    }
    return dict ? jsonResponse(dict) : notFound;
};

const deleteTask = async (req: Request) => {
    const task = await req.json() as ITask;
    letDelete(task);
    putTask(task);
    return ok;
};

const fetchAdd = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const tag = params.get('tag') as Tag | null;
    if (!tag) return badRequest;
    const words = [];
    for (const word in vocabulary) if (vocabulary[word]?.includes(tag)) words.push(word);
    await addTasks(words);
    sendMessage({ type: 'stats', data: g.stats = await totalStats() });
    return ok;
};

const postStudy = async (req: Request) => {
    const otask = await req.json() as ITask;
    const task = await getTask(otask.word);
    if (!task) return notFound;
    let level = otask.level;
    const tags = vocabulary[task.word];
    adjTaskToStats(task, g.stats, tags, -1);
    if (level >= 15) level = 15;
    else level++
    task.level = level;
    task.last = now();
    task.next = level >= 15 ? MAX_NEXT : task.last + Math.round(39 * level ** 3 * 1.5 ** level);
    await putTask(task);
    adjTaskToStats(task, g.stats, tags, 1);
    return ok;
}

const fetchEpisode = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const sprint = parseInt(params.get('sprint')!);
    const tag = params.get('tag') as Tag;
    const blevel = params.get('blevel') as BLevel;
    if (isNaN(sprint)) return badRequest;
    const ts = await getEpisode(sprint, tag, blevel);
    return jsonResponse(ts);
};

const putSetting = async (req: Request) => {
    const setting = await req.json() as ISetting;
    setting.version = now();
    setKv('_setting', setting);
    syncSetting(setting);
    return ok;
};

const fetchLogout = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const cleanCache = params.get('cleanCache');
    if (cleanCache) await clearDict();
    await clearTask();
    await clearKv();
    return ok;
};

const submitIssue = (req: Request) => {
    const issue = new URL(req.url).searchParams.get('issue');
    if (!issue) return badRequest;
    addIssue(issue);
    return ok;
};

const fetchVocabulary = () => jsonResponse(Object.keys(vocabulary));

const fetchSearch = async (req: Request) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return badRequest;
    return jsonResponse((await getTask(word)) ?? newTask(word, now()));
};

const init = async () => {
    await indexdbInit();
    const res = await fetch(VOCABULARY_URL, { cache: 'force-cache' });
    const delimiter = /[,:] */;
    if (res.ok) for (let line of (await res.text()).split('\n')) if (line = line.trim()) {
        const [word, ...tags] = line.split(delimiter).map(w => w.trim());
        vocabulary[word] = tags as Array<Tag>;
    }
    const _vocabulary_url: string = await getKv('_vocabulary-url');
    if (VOCABULARY_URL !== _vocabulary_url && Object.keys(vocabulary).length > 20000) {
        await clarifyTask();
        await clarifyDiction();
        await setKv('_vocabulary-url', VOCABULARY_URL);
    }
    await syncSetting();
    await syncTasks();
    sendMessage({ type: 'stats', data: g.stats = await totalStats() });
};

init();