/// <reference lib="webworker" />
import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel } from "./istat.ts";
import { badRequest, jsonResponse, notFound, ok, requestInit } from "@sholvoir/generic/http";
import { blobToBase64 } from "@sholvoir/generic/blob";
import { VOCABULARY_URL, DICT_API, now } from "./common.ts";
import { IDict } from "@sholvoir/dict/lib/idict.ts";
import { IItem, item2task } from "./iitem.ts";
import * as idb from "./indexdb.ts";
import denoConfig from "../deno.json" with { type: "json" };

declare const self: ServiceWorkerGlobalScope;
self.oninstall = (e) => e.waitUntil(self.skipWaiting());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));

const dictExpire = 7 * 24 * 60 * 60;
const workerVersion = denoConfig.version;
const cacheName = `MemWord-V${workerVersion}`;

const handleActivate = async () => {
    await self.registration?.navigationPreload.disable();
    for (const cacheKey of await caches.keys()) if (cacheKey !== cacheName) await caches.delete(cacheKey)
    const _vocabulary_url: string = await idb.getMeta('_vocabulary-url');
    if (VOCABULARY_URL !== _vocabulary_url) {
        const res = await fetch(VOCABULARY_URL, { cache: 'force-cache' });
        if (res.ok) {
            await idb.updateVocabulary((await res.text()).split('\n'));
            await idb.setMeta('_vocabulary-url', VOCABULARY_URL);
        }
    }
    await self.clients.claim();
};

const putInCache = async (request: Request, response: Response) => {
    await (await caches.open(cacheName)).put(request, response);
};

const handleFetch = async (request: Request) => {
    const pathname = new URL(request.url).pathname;
    if (pathname.startsWith('/wkr')) console.log(pathname);
    switch (pathname) {
        case '/wkr/get-episode': return handleFetchEpisode(request);
        case '/wkr/update-dict': return handleUpdateDict(request);
        case '/wkr/cache-dict': cacheDict(); return ok;
        case '/wkr/version': return jsonResponse({version: workerVersion});
        case '/wkr/add-tasks': return handleFetchAdd(request);
        case '/wkr/sync-tasks': syncTasks(); return ok;
        case '/wkr/studied': return handleFetchStudied(request);
        case '/wkr/submit-issue': return handleIssue(request);
        case '/wkr/search': return handleFetchSearch(request);
        case '/wkr/get-stats': return jsonResponse(await idb.getStats());
        case '/wkr/get-vocabulary': return jsonResponse(await idb.getVocabulary());
        case '/wkr/logout': await idb.clear(); return ok;
        case '/api/setting': return fetch(request);
        case '/signup': return fetch(request);
        case '/login': return fetch(request);
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

const updateDict = async (word: string): Promise<IItem|undefined> => {
    const resp = await fetch(`${DICT_API}/pub/word?q=${encodeURIComponent(word)}`, { cache: 'reload' });
    if (!resp.ok) return undefined;
    const dict: IDict = await resp.json();
    if (dict.sound) {
        const resp = await fetch(`${DICT_API}/pub/sound?q=${encodeURIComponent(dict.sound)}`, { cache: 'force-cache' });
        if (resp.ok) dict.sound = await blobToBase64(await resp.blob());
    }
    return await idb.updateDict(word, dict);
}

const itemUpdateDict = async (item?: IItem) => {
    if (!item) return undefined;
    if (item.dversion === 0) {
        const nitem = await updateDict(item.word);
        return nitem ?? item;
    }
    if (item.dversion + dictExpire < now()) {
        updateDict(item.word);
    }
    return item;
}

const syncTasks = async (lastTime?: number) => {
    const thisTime = now();
    if (!lastTime) lastTime = (await idb.getMeta('_sync-time')) ?? 1;
    const tasks = (await idb.getItems(lastTime!)).map(item2task);
    const resp = await fetch(`/api/task?lastgt=${lastTime}`, requestInit(tasks));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await idb.mergeTasks(ntasks);
    await idb.setMeta('_sync-time', thisTime);
};

const submitIssues = async () => {
    const issues = await idb.getIssues();
    for (const issue of issues) {
        const res = await fetch('/api/issue', requestInit(issue));
        if (!res.ok) break;
        await idb.deleteIssue(issue.id);
    }
};

const cacheDict = async () => {};

const handleUpdateDict = async (req: Request) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return badRequest;
    const item = await updateDict(word);
    return item ? jsonResponse(item) : notFound;
};

const handleFetchAdd = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const tag = params.get('tag') as Tag | null;
    if (!tag) return badRequest;
    await idb.addTasks(tag);
    return ok;
};

const handleFetchStudied = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const word = params.get('word');
    const level = +(params.get('level')??0);
    if (!word) return badRequest;
    await idb.studied(word, level);
    return ok;
}

const handleFetchEpisode = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const tag = params.get('tag') as Tag;
    const blevel = params.get('blevel') as BLevel;
    const item = await idb.getEpisode(tag, blevel);
    return jsonResponse(await itemUpdateDict(item));
};

const handleIssue = async (req: Request) => {
    if (req.method == 'POST') {
        const data = await req.json();
        if (!data) return badRequest;
        await idb.addIssue(data.issue);
    }
    submitIssues();
    return ok;
};

const handleFetchSearch = async (req: Request) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return badRequest;
    const item = await idb.getItem(word);
    return jsonResponse(await itemUpdateDict(item));
};