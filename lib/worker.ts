/// <reference lib="webworker" />

import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel, initStats } from "./istat.ts";
import { badRequest, jsonResponse, notFound, ok, requestInit } from "@sholvoir/generic/http";
import { now } from "./common.ts";
import { IDiction } from "./idict.ts";
import { ISetting, defaultSetting } from "./isetting.ts";
import { letDelete, newTask } from "./itask.ts";
import * as idb from "./indexdb.ts";
import denoConfig from "../deno.json" with { type: "json" };

declare const self: ServiceWorkerGlobalScope;
self.oninstall = (e) => e.waitUntil(self.skipWaiting());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));

const VOCABULARY_URL = 'https://www.micit.co/vocabulary/vocabulary-0.0.28.txt';
const DICT_API = 'https://dict.micit.co/api';
const dictExpire = 7 * 24 * 60 * 60;
const cacheName = `MemWord-V${denoConfig.version}`;
const g = { inited: false, stats: initStats() };

const handleActivate = async () => {
    await self.registration?.navigationPreload.disable();
    for (const cacheKey of await caches.keys()) if (cacheKey !== cacheName) await caches.delete(cacheKey)
    await self.clients.claim();
};

const putInCache = async (request: Request, response: Response) => {
    await (await caches.open(cacheName)).put(request, response);
};

const handleFetch = async (request: Request) => {
    if (!g.inited) await init();
    const url = new URL(request.url)
    switch (url.pathname) {
        case '/episode': return await handleFetchEpisode(request);
        case '/dict': return await handleFetchDict(request);
        case '/cache': cacheDict(); return ok;
        case '/setting': return await handleSyncSetting(request);
        case '/add': return handleFetchAdd(request);
        case '/delete': return await handleDeleteTask(request);
        case '/sync': syncTasks(); return ok;
        case '/study': return await handleFetchStudy(request);
        case '/issue': return handlePostIssue(request);
        case '/search': return await handleFetchSearch(request);
        case '/update': return updateStats();
        case '/signup': return fetch(request);
        case '/login': return fetch(request);
        case '/logout': return await handleFetchLogout(request);
        case '/vocabulary': return jsonResponse(await idb.getVocabulary());
        default: {
            const responseFromCache = await caches.match(request);
            if (responseFromCache) return responseFromCache;
            const responseFromNetwork = await fetch(request);
            if (responseFromNetwork.ok && !url.pathname.includes('_frsh'))
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
    if (!lastTime) lastTime = (await idb.getKv('_sync-time')) ?? 0;
    const resp = await fetch(`/task?lastgt=${lastTime}`, requestInit(await idb.getTasks(lastTime!)));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await idb.mergeTasks(ntasks);
    await idb.setKv('_sync-time', thisTime);
};

const syncSetting = async (setting?: ISetting) => {
    if (!setting) setting = (await idb.getKv('_setting')) ?? defaultSetting();
    const res = await fetch('/setting', requestInit(setting));
    if (res.ok) {
        const nsetting: ISetting = await res.json();
        if (nsetting.version > setting!.version) await idb.setKv('_setting', nsetting);
    }
};

const updateStats = async () => {
    g.stats = await idb.updateStats(g.stats);
    return jsonResponse(g.stats);
}

const cacheDict = async () => {
    for (const task of await idb.getTasks(0)) if (task?.word) {
        const word = task.word;
        if (!await idb.getDiction(word)) {
            const dict = await fetchDiction(word);
            if (dict) await idb.putDiction(dict);
            else console.error(`Can not fetch word: ${word}.`)
        }
    }
};

const submitIssues = async () => {
    const issues = await idb.getIssues();
    for (const issue of issues) {
        const res = await fetch('/issue', requestInit(issue));
        if (!res.ok) break;
        await idb.deleteIssue(issue.id);
    }
}

const handleFetchDict = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const word = params.get('word');
    const reload = params.get('reload');
    if (!word) return badRequest;
    let dict: IDiction | undefined = undefined;
    if (reload) {
        dict = await fetchDiction(word);
        if (dict) idb.putDiction(dict);
        else dict = await idb.getDiction(word);
    } else {
        dict = await idb.getDiction(word);
        if (dict) {
            if (dict.version + dictExpire < now())
                fetchDiction(word).then(d => d ? idb.putDiction(d) : undefined);
        } else {
            dict = await fetchDiction(word);
            if (dict) idb.putDiction(dict);
        }
    }
    return dict ? jsonResponse(dict) : notFound;
};

const handleDeleteTask = async (req: Request) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return badRequest;
    const task = await idb.getTask(word);
    letDelete(task);
    idb.putTask(task);
    return ok;
};

const handleFetchAdd = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const tag = params.get('tag') as Tag | null;
    if (!tag) return badRequest;
    await idb.addTasks(tag);
    g.stats = await idb.totalStats();
    return ok;
};

const handleFetchStudy = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const word = params.get('word');
    const level = +(params.get('level')??0);
    if (!word) return badRequest;
    await idb.studyWord(word, level, g.stats);
    return ok;
}

const handleFetchEpisode = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const sprint = parseInt(params.get('sprint')!);
    const tag = params.get('tag') as Tag;
    const blevel = params.get('blevel') as BLevel;
    if (isNaN(sprint)) return badRequest;
    const ts = await idb.getEpisode(sprint, tag, blevel);
    return jsonResponse(ts);
};

const handleSyncSetting = async (req: Request) => {
    const nsetting = await req.json() as ISetting;
    const osetting = await idb.getKv('_setting') as ISetting;
    if (nsetting.version <= osetting.version) return jsonResponse(osetting);
    idb.setKv('_setting', nsetting);
    syncSetting(nsetting);
    return jsonResponse(nsetting);
};

const handleFetchLogout = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const cleanCache = params.get('cleanCache');
    if (cleanCache) await idb.clearDict();
    await idb.clearTask();
    await idb.clearKv();
    return ok;
};

const handlePostIssue = async (req: Request) => {
    const data = await req.json();
    if (!data) return badRequest;
    await idb.addIssue(data.issue);
    submitIssues();
    return ok;
};

const handleFetchSearch = async (req: Request) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return badRequest;
    return jsonResponse((await idb.getTask(word)) ?? newTask(word, now()));
};

const init = async () => {
    if (!g.inited) {
        await idb.init();
        const _vocabulary_url: string = await idb.getKv('_vocabulary-url');
        if (VOCABULARY_URL !== _vocabulary_url) {
            const res = await fetch(VOCABULARY_URL, { cache: 'force-cache' });
            if (res.ok) await idb.updateVocabulary((await res.text()).split('\n'));
            await idb.clarifyTask();
            await idb.clarifyDiction();
            await idb.setKv('_vocabulary-url', VOCABULARY_URL);
        }
        await syncSetting();
        await syncTasks();
        g.stats = await idb.totalStats();
        submitIssues();
        g.inited = true;
    }
};