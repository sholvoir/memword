/// <reference lib="webworker" />

import { API_URL, version } from "./common.ts";

const cacheName = `MemWord-V${version}`;
const memwordApi = new RegExp(`^${API_URL}/(pub|api|admin)/`);

const handleActivate = async () => {
	for (const cacheKey of await caches.keys())
		if (cacheKey !== cacheName) await caches.delete(cacheKey);
	await self.clients.claim();
};

const putInCache = async (req: Request, res: Response) => {
	await (await caches.open(cacheName)).put(req, res);
};

const handleFetch = async (req: Request) => {
	console.log(req.url);
	if (memwordApi.test(req.url)) return await fetch(req);
	const cres = await caches.match(req);
	if (cres) return cres;
	const nresp = await fetch(req);
	if (nresp.ok) putInCache(req, nresp.clone());
	return nresp;
};

declare const self: ServiceWorkerGlobalScope;
self.oninstall = (e) => e.waitUntil(self.skipWaiting());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));
