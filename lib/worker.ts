/// <reference lib="webworker" />

import { IMessage } from "./imessage.ts";

declare const self: ServiceWorkerGlobalScope;
self.oninstall = (e) => e.waitUntil(handleInstall());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));

const cacheName = 'MemWord-V1';
const staticFiles = ['/', '/icon/icon-192.png', '/icon/icon-1024.png', '/styles.css'];

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
        // case '/user': return fetchUser();
        // case '/vocabulary': return fetchVocabulary();
        // case '/dict': return await fetchDict(request);
        // case '/search': return await fetchSearch(request);
        // case '/setting': await putSetting(request);return ok;
        // case '/episode': return await fetchEpisode(request);
        // case '/update': updateStats(); return ok;
        // case '/delete': return await deleteTask(request);
        // case '/sync': await syncTasks(); return ok;
        // case '/add': return addTasks(request);
        // case '/study': await postStudy(request);return ok;
        // case '/login': return await fetchLogin(request);
        // case '/logout': return await fetchLogout(request);
        // case '/issue': return submitIssue(request);
        // case '/signup': return fetch(request);
        default: {
            // const responseFromCache = await caches.match(request);
            // if (responseFromCache) return responseFromCache;
            // const responseFromNetwork = await fetch(request);
            // if (responseFromNetwork.ok)
            //     putInCache(request, responseFromNetwork.clone());
            // return responseFromNetwork;
        }
    }
    return await fetch(request);
};