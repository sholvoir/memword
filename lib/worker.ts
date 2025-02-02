// deno-lint-ignore-file no-cond-assign
/// <reference lib="webworker" />
import { emptyResponse, HTTPMethod, jsonResponse, requestInit, STATUS_CODE } from "@sholvoir/generic/http";
import { blobToBase64 } from "@sholvoir/generic/blob";
import { B2_BASE_URL, now } from "./common.ts";
import { IDict } from "./idict.ts";
import { IItem, item2task } from "./iitem.ts";
import * as idb from "./indexdb.ts";
import denoConfig from "../deno.json" with { type: "json" };
import { splitID } from "./wordlist.ts";
import { defaultSetting, ISetting } from "./isetting.ts";

declare const self: ServiceWorkerGlobalScope;
const handleActivate = async () => {
    for (const cacheKey of await caches.keys()) if (cacheKey !== cacheName) await caches.delete(cacheKey)    
    await self.clients.claim();
};
self.oninstall = (e) => e.waitUntil(self.skipWaiting());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));

const dictExpire = 7 * 24 * 60 * 60;
const workerVersion = denoConfig.version;
const cacheName = `MemWord-V${workerVersion}`;
const wordlists: Record<string, Set<string>> = {};

const putInCache = async (request: Request, response: Response) => {
    await (await caches.open(cacheName)).put(request, response);
};

const handleFetch = async (req: Request) => {
    const pathname = new URL(req.url).pathname;
    console.log(pathname);
    switch (pathname) {
        case '/wkr/update': return emptyResponse();
        case '/wkr/setting': return handleSetting(req);
        case '/wkr/get-episode': return handleFetchEpisode(req);
        case '/wkr/update-dict': return handleUpdateDict(req);
        case '/wkr/cache-dict': cacheDict(); return emptyResponse();
        case '/wkr/version': return jsonResponse({version: workerVersion});
        case '/wkr/add-tasks': return handleFetchAdd(req);
        case '/wkr/sync-tasks': syncTasks(); return emptyResponse();
        case '/wkr/down-tasks': await downTasks(); return emptyResponse();
        case '/wkr/studied': return handleFetchStudied(req);
        case '/wkr/submit-issue': return handleIssue(req);
        case '/wkr/search': return handleFetchSearch(req);
        case '/wkr/get-stats': return jsonResponse(await idb.getStats());
        case '/wkr/get-vocabulary': return handleFetchVocabulary();
        case '/wkr/update-vocabulary': return handleUpdateVocabulary();
        case '/wkr/logout': await idb.clear(); return emptyResponse();
        case '/signup': return fetch(req);
        case '/login': return fetch(req);
        default: {
            const respFromCache = await caches.match(req);
            if (respFromCache) return respFromCache;
            const respFromNetwork = await fetch(req);
            if (respFromNetwork.ok)
                putInCache(req, respFromNetwork.clone());
            return respFromNetwork;
        }
    }
};

const updateDict = async (word: string): Promise<IItem|undefined> => {
    const resp = await fetch(`/pub/word?q=${encodeURIComponent(word)}`, { cache: 'reload' });
    if (!resp.ok) return undefined;
    const dict: IDict = await resp.json();
    if (dict.sound) {
        const resp = await fetch(`/pub/sound?q=${encodeURIComponent(dict.sound)}`, { cache: 'force-cache' });
        if (resp.ok) dict.sound = await blobToBase64(await resp.blob());
    }
    return await idb.updateDict(word, dict);
}

const itemUpdateDict = async (item?: IItem) => {
    if (!item) return undefined;
    if (!item.dversion) {
        const nitem = await updateDict(item.word);
        return nitem ?? item;
    } else if (item.dversion + dictExpire < now()) {
        updateDict(item.word);
    }
    return item;
}

const syncTasks = async () => {
    const thisTime = now();
    const lastTime: number = (await idb.getMeta('_sync-time')) ?? 1;
    const tasks = (await idb.getItems(lastTime)).map(item2task);
    const resp = await fetch(`/api/task?lastgt=${lastTime}`, requestInit(tasks));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await idb.mergeTasks(ntasks);
    await idb.setMeta('_sync-time', thisTime);
};

const downTasks = async () => {
    const resp = await fetch(`/api/task?lastgt=0`, requestInit([]));
    if (!resp.ok) return console.error('Network Error: download task data error.');
    const ntasks = await resp.json();
    await idb.mergeTasks(ntasks);
}

const submitIssues = async () => {
    const issues = await idb.getIssues();
    for (const issue of issues) {
        const res = await fetch('/api/issue', requestInit(issue));
        if (!res.ok) break;
        await idb.deleteIssue(issue.id);
    }
};

const cacheDict = async () => {};

const handleSetting = async (req: Request) => {
    switch (req.method as HTTPMethod) {
        case 'GET': {
            let setting = await idb.getMeta('_setting');
            if (setting) return jsonResponse(setting);
            const res = await fetch('/api/setting', requestInit(defaultSetting));
            if (!res.ok) return res;
            setting = await res.json();
            idb.setMeta('_setting', setting);
            return jsonResponse(setting);
        }
        case 'POST': {
            (async () => {
                const clientSetting: ISetting = await req.json();
                const workerSetting: ISetting = await idb.getMeta('_setting');
                if (!workerSetting || workerSetting.version < clientSetting.version) {
                    await idb.setMeta('_setting', clientSetting);
                    const res = await fetch('/api/setting', clientSetting);
                    if (!res.ok) return;
                    const serverSetting: ISetting = await res.json();
                    if (serverSetting.version > clientSetting.version)
                        await idb.setMeta('_setting', serverSetting);
                }
            })();
            return emptyResponse();
        }
        default: return emptyResponse(STATUS_CODE.MethodNotAllowed);
    }
};

const handleUpdateDict = async (req: Request) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return emptyResponse(STATUS_CODE.BadRequest);
    const item = await updateDict(word);
    return item ? jsonResponse(item) : emptyResponse(STATUS_CODE.NotFound);
};

const getWordlistVersion = async (user: string, name: string): Promise<string|undefined> => {
    const res = await fetch(`/api/wordlist?user=${encodeURIComponent(user)}&name=${encodeURIComponent(name)}`);
    if (!res.ok) return;
    return (await res.json()).version;
}

const getWordList = async (user: string, name: string): Promise<Set<string>|undefined> => {
    const wlid = `${user}/${name}`;
    let wordlist = wordlists[wlid];
    if (wordlist) {
        // todo update wordlist backend
        return wordlist;
    }
    let version = await idb.getWordlistVersion(user, name);
    if (!version) {
        version = await getWordlistVersion(user, name);
        if (!version) return;
        await idb.setWordlistVersion({ wlid, version });
    }
    const res = await fetch(`${B2_BASE_URL}/${user}/${name}-${version}.txt`);
    wordlist = new Set<string>();
    for (let line of (await res.text()).split('\n'))
        if (line = line.trim()) wordlist.add(line);
    return wordlists[wlid] = wordlist;
}

const handleFetchAdd = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const user = params.get('user');
    const name = params.get('name');
    if (!user || !name) return emptyResponse(STATUS_CODE.BadRequest);
    const words = await getWordList(user, name);
    if (!words) return emptyResponse(STATUS_CODE.InternalServerError);
    await idb.addTasks(words);
    return emptyResponse();
};

const handleFetchStudied = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const word = params.get('word');
    const level = +(params.get('level')??0);
    if (!word) return emptyResponse(STATUS_CODE.BadRequest);
    await idb.studied(word, level);
    return emptyResponse();
}

const handleFetchEpisode = async (req: Request) => {
    const params = new URL(req.url).searchParams;
    const rblevel = params.get('blevel');
    const blevel = rblevel ? +rblevel : undefined;
    const wordListId = params.get('wordListId');
    let item: IItem|undefined;
    if (wordListId) {
        const username = splitID(wordListId);
        if (username) {
            const [user, name] = username;
            const words = await getWordList(user, name);
            item = await idb.getEpisode(words, blevel);
        } else item = await idb.getEpisode(undefined, blevel);
    } else item = await idb.getEpisode(undefined, blevel);
    return jsonResponse({item: await itemUpdateDict(item)});
};

const handleIssue = async (req: Request) => {
    if (req.method == 'POST') {
        const data = await req.json();
        if (!data) return emptyResponse(STATUS_CODE.BadRequest);
        await idb.addIssue(data.issue);
    }
    submitIssues();
    return emptyResponse();
};

const handleFetchSearch = async (req: Request) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return emptyResponse(STATUS_CODE.BadRequest);
    const item = await idb.getItem(word);
    return jsonResponse(await itemUpdateDict(item));
};

const handleFetchVocabulary = async () => {
    const vocabulary = await getWordList('system', 'vocabulty');
    if (!vocabulary) return emptyResponse(STATUS_CODE.InternalServerError);
    return jsonResponse(Array.from(vocabulary).sort());
}

const handleUpdateVocabulary = () => {
    // const resp1 = await fetch(`${DICT_API}/pub/vocabulary-version`, { cache: 'no-cache' });
    // if (!resp1.ok) return emptyResponse(STATUS_CODE.NotFound); // Network Error
    // const serverVocabularyVersion: string = (await resp1.json()).vocabularyVersion;
    // const clientVocabularyVersion: string = await idb.getMeta('_vocabulary-version');
    // if (serverVocabularyVersion === clientVocabularyVersion) return emptyResponse(STATUS_CODE.NotFound); // Not Need Update
    // const resp2 = await fetch(`${B2_BASE_URL}/vocabulary-${serverVocabularyVersion}.txt`, { cache: 'force-cache' });
    // if (!resp2.ok) return emptyResponse(STATUS_CODE.NotFound); // Network Error
    // const delimiter = /[,:] */;
    // const vocabulary = new Map<string, Array<Tag>>();
    // const words: Array<string> = [];
    // for (let line of (await resp2.text()).split('\n')) if (line = line.trim()) {
    //     const [word, ...tags] = line.split(delimiter).map(w => w.trim());
    //     vocabulary.set(word, tags as Array<Tag>);
    //     words.push(word);
    // }
    // const needDelete = await idb.updateVocabulary(vocabulary);
    // if (needDelete.length) await fetch('/api/task', requestInit(needDelete, 'DELETE'));
    // await idb.setMeta('_vocabulary-version', serverVocabularyVersion);
    return emptyResponse(); // jsonResponse(words);
}