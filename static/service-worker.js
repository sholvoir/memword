// https://jsr.io/@sholvoir/vocabulary/0.0.16/src/tag.ts
var Tags = [
  "OG",
  "FS",
  "MC",
  "LD",
  "S1",
  "S2",
  "S3",
  "W1",
  "W2",
  "W3",
  "VA",
  "WK",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "GL",
  "GS",
  "AW",
  "TL",
  "BL",
  "DL",
  "FE",
  "CA",
  "WB",
  "BN",
  "BS",
  "BW",
  "ZK",
  "GK",
  "KY",
  "T4",
  "T6",
  "TF",
  "IS",
  "ST",
  "GR",
  "GM",
  "BE",
  "LH",
  "__"
];

// lib/itask.ts
var MAX_NEXT = 2e9;
var neverTask = (word) => ({ word, last: 0, next: MAX_NEXT, level: 0 });
var isNever = (task) => task.last === 0;
var newTask = (word, time) => ({ word, last: time, next: 0, level: 0 });
var letDelete = (task) => {
  task.last = MAX_NEXT;
};
var shouldDelete = (task) => task.last === MAX_NEXT;

// lib/istat.ts
var statsFormat = "0.1.0";
var newStat = () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var bLevelIncludes = (blevel, level) => {
  switch (blevel) {
    case "never":
      return level <= 0;
    case "start":
      return level >= 1 && level <= 5;
    case "medium":
      return level >= 6 && level <= 9;
    case "familiar":
      return level >= 10 && level <= 12;
    case "skilled":
      return level >= 13 && level <= 14;
    case "finished":
      return level >= 15;
  }
};
var initStats = (time = 0) => {
  const stats = { format: statsFormat, time, all: {}, task: {} };
  for (const tag of Tags) {
    stats.all[tag] = newStat();
    stats.task[tag] = newStat();
  }
  return stats;
};
var adjTaskToStats = (task, stats, tags, direction = 0) => {
  if (!isNever(task)) {
    stats.all["__"][task.level] += direction;
    if (task.next < stats.time) stats.task["__"][task.level] += direction;
  }
  for (const tag of tags) {
    stats.all[tag][task.level] += direction;
    if (task.next < stats.time) stats.task[tag][task.level] += direction;
  }
};

// https://jsr.io/@sholvoir/generic/0.0.10/http.ts
var STATUS_CODE = {
  /** RFC 7231, 6.2.1 */
  Continue: 100,
  /** RFC 7231, 6.2.2 */
  SwitchingProtocols: 101,
  /** RFC 2518, 10.1 */
  Processing: 102,
  /** RFC 8297 **/
  EarlyHints: 103,
  /** RFC 7231, 6.3.1 */
  OK: 200,
  /** RFC 7231, 6.3.2 */
  Created: 201,
  /** RFC 7231, 6.3.3 */
  Accepted: 202,
  /** RFC 7231, 6.3.4 */
  NonAuthoritativeInfo: 203,
  /** RFC 7231, 6.3.5 */
  NoContent: 204,
  /** RFC 7231, 6.3.6 */
  ResetContent: 205,
  /** RFC 7233, 4.1 */
  PartialContent: 206,
  /** RFC 4918, 11.1 */
  MultiStatus: 207,
  /** RFC 5842, 7.1 */
  AlreadyReported: 208,
  /** RFC 3229, 10.4.1 */
  IMUsed: 226,
  /** RFC 7231, 6.4.1 */
  MultipleChoices: 300,
  /** RFC 7231, 6.4.2 */
  MovedPermanently: 301,
  /** RFC 7231, 6.4.3 */
  Found: 302,
  /** RFC 7231, 6.4.4 */
  SeeOther: 303,
  /** RFC 7232, 4.1 */
  NotModified: 304,
  /** RFC 7231, 6.4.5 */
  UseProxy: 305,
  /** RFC 7231, 6.4.7 */
  TemporaryRedirect: 307,
  /** RFC 7538, 3 */
  PermanentRedirect: 308,
  /** RFC 7231, 6.5.1 */
  BadRequest: 400,
  /** RFC 7235, 3.1 */
  Unauthorized: 401,
  /** RFC 7231, 6.5.2 */
  PaymentRequired: 402,
  /** RFC 7231, 6.5.3 */
  Forbidden: 403,
  /** RFC 7231, 6.5.4 */
  NotFound: 404,
  /** RFC 7231, 6.5.5 */
  MethodNotAllowed: 405,
  /** RFC 7231, 6.5.6 */
  NotAcceptable: 406,
  /** RFC 7235, 3.2 */
  ProxyAuthRequired: 407,
  /** RFC 7231, 6.5.7 */
  RequestTimeout: 408,
  /** RFC 7231, 6.5.8 */
  Conflict: 409,
  /** RFC 7231, 6.5.9 */
  Gone: 410,
  /** RFC 7231, 6.5.10 */
  LengthRequired: 411,
  /** RFC 7232, 4.2 */
  PreconditionFailed: 412,
  /** RFC 7231, 6.5.11 */
  ContentTooLarge: 413,
  /** RFC 7231, 6.5.12 */
  URITooLong: 414,
  /** RFC 7231, 6.5.13 */
  UnsupportedMediaType: 415,
  /** RFC 7233, 4.4 */
  RangeNotSatisfiable: 416,
  /** RFC 7231, 6.5.14 */
  ExpectationFailed: 417,
  /** RFC 7168, 2.3.3 */
  Teapot: 418,
  /** RFC 7540, 9.1.2 */
  MisdirectedRequest: 421,
  /** RFC 4918, 11.2 */
  UnprocessableEntity: 422,
  /** RFC 4918, 11.3 */
  Locked: 423,
  /** RFC 4918, 11.4 */
  FailedDependency: 424,
  /** RFC 8470, 5.2 */
  TooEarly: 425,
  /** RFC 7231, 6.5.15 */
  UpgradeRequired: 426,
  /** RFC 6585, 3 */
  PreconditionRequired: 428,
  /** RFC 6585, 4 */
  TooManyRequests: 429,
  /** RFC 6585, 5 */
  RequestHeaderFieldsTooLarge: 431,
  /** RFC 7725, 3 */
  UnavailableForLegalReasons: 451,
  /** RFC 7231, 6.6.1 */
  InternalServerError: 500,
  /** RFC 7231, 6.6.2 */
  NotImplemented: 501,
  /** RFC 7231, 6.6.3 */
  BadGateway: 502,
  /** RFC 7231, 6.6.4 */
  ServiceUnavailable: 503,
  /** RFC 7231, 6.6.5 */
  GatewayTimeout: 504,
  /** RFC 7231, 6.6.6 */
  HTTPVersionNotSupported: 505,
  /** RFC 2295, 8.1 */
  VariantAlsoNegotiates: 506,
  /** RFC 4918, 11.5 */
  InsufficientStorage: 507,
  /** RFC 5842, 7.2 */
  LoopDetected: 508,
  /** RFC 2774, 7 */
  NotExtended: 510,
  /** RFC 6585, 6 */
  NetworkAuthenticationRequired: 511
};
var jsonHeader = () => new Headers({ "Content-Type": "application/json" });
var responseInit = { headers: jsonHeader() };
var ok = new Response();
var notFound = new Response(void 0, { status: STATUS_CODE.NotFound });
var forbidden = new Response(void 0, { status: STATUS_CODE.Forbidden });
var badRequest = new Response(void 0, { status: STATUS_CODE.BadRequest });
var internalServerError = new Response(void 0, { status: STATUS_CODE.InternalServerError });
var jsonResponse = (body) => new Response(JSON.stringify(body), responseInit);
var requestInit = (body, method = "POST", headers) => ({ method, headers: headers ?? jsonHeader(), body: JSON.stringify(body) });

// lib/common.ts
var VOCABULARY_URL = "https://www.micit.co/vocabulary/vocabulary-0.0.28.txt";
var now = () => Math.floor(Date.now() / 1e3);

// lib/isetting.ts
var settingFormat = "0.1.0";
var defaultSetting = () => ({
  format: settingFormat,
  version: 0,
  sprint: 10,
  books: ["__"]
});

// lib/indexdb.ts
var g = {};
var vocabulary = {};
var clearDict = () => new Promise((resolve, reject) => {
  const request = g.db.transaction("dict", "readwrite").objectStore("dict").clear();
  request.onerror = reject;
  request.onsuccess = resolve;
});
var clearTask = () => new Promise((resolve, reject) => {
  const request = g.db.transaction("task", "readwrite").objectStore("task").clear();
  request.onerror = reject;
  request.onsuccess = resolve;
});
var clearKv = () => new Promise((resolve, reject) => {
  const request = g.db.transaction("kv", "readwrite").objectStore("kv").clear();
  request.onerror = reject;
  request.onsuccess = resolve;
});
var getKv = (key) => new Promise((resolve, reject) => {
  const request = g.db.transaction("kv", "readonly").objectStore("kv").get(key);
  request.onerror = reject;
  request.onsuccess = () => resolve(request.result && request.result.value);
});
var setKv = (key, value) => new Promise((resolve, reject) => {
  const request = g.db.transaction("kv", "readwrite").objectStore("kv").put({ key, value });
  request.onerror = reject;
  request.onsuccess = () => resolve();
});
var addIssue = (issue) => new Promise((resolve, reject) => {
  const request = g.db.transaction("issue", "readwrite").objectStore("issue").add({ issue });
  request.onerror = reject;
  request.onsuccess = () => resolve();
});
var getDiction = (word) => new Promise((resolve, reject) => {
  const request = g.db.transaction("dict", "readonly").objectStore("dict").get(word);
  request.onerror = reject;
  request.onsuccess = () => resolve(request.result);
});
var putDiction = (diction) => new Promise((resolve, reject) => {
  const request = g.db.transaction("dict", "readwrite").objectStore("dict").put(diction);
  request.onerror = reject;
  request.onsuccess = () => resolve();
});
var clarifyDiction = () => new Promise((resolve, reject) => {
  const request = g.db.transaction("dict", "readwrite").objectStore("dict").openCursor();
  request.onerror = reject;
  request.onsuccess = () => {
    const cursor = request.result;
    if (!cursor) return resolve();
    const dict = cursor.value;
    if (!vocabulary[dict.word]) cursor.delete();
    cursor.continue();
  };
});
var getTask = (word) => new Promise((resolve, reject) => {
  const request = g.db.transaction("task", "readonly").objectStore("task").get(word);
  request.onerror = reject;
  request.onsuccess = () => resolve(request.result);
});
var putTask = (task) => new Promise((resolve, reject) => {
  const request = g.db.transaction("task", "readwrite").objectStore("task").put(task);
  request.onerror = reject;
  request.onsuccess = () => resolve();
});
var getTasks = (last) => new Promise((resolve, reject) => {
  const request = g.db.transaction("task", "readonly").objectStore("task").index("last").getAll(IDBKeyRange.lowerBound(last));
  request.onerror = reject;
  request.onsuccess = () => resolve(request.result);
});
var addTasks = (words) => new Promise((resolve, reject) => {
  const transaction = g.db.transaction("task", "readwrite");
  transaction.onerror = reject;
  transaction.oncomplete = () => resolve();
  const objectStore = transaction.objectStore("task");
  const time = now();
  for (const word in words)
    objectStore.get(word).onsuccess = (e) => e.target.result || objectStore.add(newTask(word, time));
});
var mergeTasks = (tasks) => new Promise((resolve, reject) => {
  const transaction = g.db.transaction("task", "readwrite");
  transaction.onerror = reject;
  transaction.oncomplete = () => resolve();
  const objectStore = transaction.objectStore("task");
  for (const ntask of tasks) {
    delete ntask._id;
    if (shouldDelete(ntask)) objectStore.delete(ntask.word);
    else objectStore.get(ntask.word).onsuccess = (e) => {
      const otask = e.target.result;
      if (!otask || ntask.last > otask.last) objectStore.put(ntask);
    };
  }
});
var clarifyTask = () => new Promise((resolve, reject) => {
  const request = g.db.transaction("task", "readwrite").objectStore("task").openCursor();
  request.onerror = reject;
  request.onsuccess = () => {
    const cursor = request.result;
    if (!cursor) return resolve();
    const task = cursor.value;
    let modified = false;
    if (task.level > 15) {
      task.level = 15;
      modified = true;
    }
    if (!vocabulary[task.word]) {
      letDelete(task);
      modified = true;
    }
    if (modified) cursor.update(task);
    cursor.continue();
  };
});
var getEpisode = (sprint, tag, blevel) => new Promise((resolve, reject) => {
  const tasks = [];
  const request = g.db.transaction("task", "readonly").objectStore("task").index("next").openCursor(IDBKeyRange.upperBound(now()), "prev");
  request.onerror = reject;
  request.onsuccess = () => {
    const cursor = request.result;
    if (!cursor) return resolve(tasks);
    const task = cursor.value;
    if ((!tag || vocabulary[task.word]?.includes(tag)) && (!blevel || bLevelIncludes(blevel, task.level)))
      tasks.push(task);
    if (tasks.length < sprint) cursor.continue();
    else resolve(tasks);
  };
});
var totalStats = () => new Promise((resolve, reject) => {
  const stats = initStats(now());
  const transaction = g.db.transaction("task", "readonly");
  transaction.onerror = reject;
  transaction.oncomplete = () => resolve(stats);
  const objectStore = transaction.objectStore("task");
  for (const word in vocabulary)
    objectStore.get(word).onsuccess = (e) => {
      const task = e.target.result ?? neverTask(word);
      adjTaskToStats(task, stats, vocabulary[word], 1);
    };
});
var updateStats = (oldStats) => new Promise((resolve, reject) => {
  const nstats = { ...oldStats, time: now() };
  const request = g.db.transaction("task", "readonly").objectStore("task").index("last").openCursor(IDBKeyRange.bound(oldStats.time, nstats.time));
  request.onerror = reject;
  request.onsuccess = () => {
    const cursor = request.result;
    if (!cursor) return resolve(nstats);
    const task = cursor.value;
    const tags = vocabulary[task.word];
    adjTaskToStats(task, oldStats, tags, -1);
    adjTaskToStats(task, nstats, tags, 1);
    cursor.continue();
  };
});
var init = async () => {
  g.db = await new Promise((resolve, reject) => {
    const request = indexedDB.open("memword", 1);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const d = request.result;
      d.createObjectStore("kv", { keyPath: "key" });
      d.createObjectStore("dict", { keyPath: "word" });
      d.createObjectStore("issue", { keyPath: "id", autoIncrement: true });
      const taskStore = d.createObjectStore("task", { keyPath: "word" });
      taskStore.createIndex("last", "last");
      taskStore.createIndex("next", "next");
    };
  });
};

// lib/worker.ts
self.oninstall = (e) => e.waitUntil(handleInstall());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));
var DICT_API = "https://dict.micit.co/api";
var dictExpire = 7 * 24 * 60 * 60;
var cacheName = "MemWord-V1";
var staticFiles = ["/", "/icon/icon-192.png", "/icon/icon-1024.png", "/styles.css"];
var g2 = { stats: initStats() };
var sendMessage = async (msg) => {
  for (const client of await self.clients.matchAll()) client.postMessage(msg);
};
var handleInstall = async () => {
  await (await caches.open(cacheName)).addAll(staticFiles);
  await self.skipWaiting();
};
var handleActivate = async () => {
  if (self.registration.navigationPreload)
    await self.registration.navigationPreload.enable();
  for (const cacheKey of await caches.keys()) {
    if (cacheKey !== cacheName)
      await caches.delete(cacheKey);
  }
  await self.clients.claim();
};
var putInCache = async (request, response) => {
  await (await caches.open(cacheName)).put(request, response);
};
var handleFetch = async (request) => {
  switch (new URL(request.url).pathname) {
    case "/vocabulary":
      return fetchVocabulary();
    case "/dict":
      return await fetchDict(request);
    case "/search":
      return await fetchSearch(request);
    case "/setting":
      return await putSetting(request);
    case "/episode":
      return await fetchEpisode(request);
    case "/update":
      upStats();
      return ok;
    case "/delete":
      return await deleteTask(request);
    case "/sync":
      syncTasks();
      return ok;
    case "/add":
      return fetchAdd(request);
    case "/study":
      await postStudy(request);
      return ok;
    case "/issue":
      return submitIssue(request);
    case "/cache":
      cacheDict();
      return ok;
    case "/signup":
      return fetch(request);
    case "/login":
      return fetch(request);
    case "/logout":
      return await fetchLogout(request);
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
var fetchDiction = async (word) => {
  const resp1 = await fetch(`${DICT_API}/${encodeURIComponent(word)}`, { cache: "reload" });
  if (!resp1.ok) return void 0;
  const dict = await resp1.json();
  dict.word = word;
  dict.version = now();
  return dict;
};
var syncTasks = async (lastTime) => {
  const thisTime = now();
  if (!lastTime) lastTime = await getKv("_sync-time") ?? 0;
  const resp = await fetch(`/task?lastgt=${lastTime}`, requestInit(await getTasks(lastTime)));
  if (!resp.ok) return console.error("Network Error: get sync task data error.");
  const ntasks = await resp.json();
  await mergeTasks(ntasks);
  await setKv("_sync-time", thisTime);
};
var syncSetting = async (setting) => {
  if (!setting) setting = await getKv("_setting") ?? defaultSetting();
  const res = await fetch("/setting", requestInit(setting));
  if (res.ok) {
    const nsetting = await res.json();
    if (nsetting.version > setting.version) {
      await setKv("_setting", nsetting);
      sendMessage({ type: "setting", data: nsetting });
    }
  }
};
var upStats = async () => await sendMessage({ type: "stats", data: g2.stats = await updateStats(g2.stats) });
var cacheDict = async () => {
  for (const task of await getTasks(0)) if (task?.word) {
    const word = task.word;
    if (!await getDiction(word)) {
      const dict = await fetchDiction(word);
      if (dict) await putDiction(dict);
      else console.error(`Can not fetch word: ${word}.`);
    }
  }
};
var fetchDict = async (req) => {
  const params = new URL(req.url).searchParams;
  const word = params.get("word");
  const reload = params.get("reload");
  if (!word) return badRequest;
  let dict = void 0;
  if (reload) {
    dict = await fetchDiction(word);
    if (dict) putDiction(dict);
    else dict = await getDiction(word);
  } else {
    dict = await getDiction(word);
    if (dict) {
      if (dict.version + dictExpire < now())
        fetchDiction(word).then((d) => d ? putDiction(d) : void 0);
    } else {
      dict = await fetchDiction(word);
      if (dict) putDiction(dict);
    }
  }
  return dict ? jsonResponse(dict) : notFound;
};
var deleteTask = async (req) => {
  const task = await req.json();
  letDelete(task);
  putTask(task);
  return ok;
};
var fetchAdd = async (req) => {
  const params = new URL(req.url).searchParams;
  const tag = params.get("tag");
  if (!tag) return badRequest;
  const words = [];
  for (const word in vocabulary) if (vocabulary[word]?.includes(tag)) words.push(word);
  await addTasks(words);
  sendMessage({ type: "stats", data: g2.stats = await totalStats() });
  return ok;
};
var postStudy = async (req) => {
  const otask = await req.json();
  const task = await getTask(otask.word);
  if (!task) return notFound;
  let level = otask.level;
  const tags = vocabulary[task.word];
  adjTaskToStats(task, g2.stats, tags, -1);
  if (level >= 15) level = 15;
  else level++;
  task.level = level;
  task.last = now();
  task.next = level >= 15 ? MAX_NEXT : task.last + Math.round(39 * level ** 3 * 1.5 ** level);
  await putTask(task);
  adjTaskToStats(task, g2.stats, tags, 1);
  return ok;
};
var fetchEpisode = async (req) => {
  const params = new URL(req.url).searchParams;
  const sprint = parseInt(params.get("sprint"));
  const tag = params.get("tag");
  const blevel = params.get("blevel");
  if (isNaN(sprint)) return badRequest;
  const ts = await getEpisode(sprint, tag, blevel);
  return jsonResponse(ts);
};
var putSetting = async (req) => {
  const setting = await req.json();
  setting.version = now();
  setKv("_setting", setting);
  syncSetting(setting);
  return ok;
};
var fetchLogout = async (req) => {
  const params = new URL(req.url).searchParams;
  const cleanCache = params.get("cleanCache");
  if (cleanCache) await clearDict();
  await clearTask();
  await clearKv();
  return ok;
};
var submitIssue = (req) => {
  const issue = new URL(req.url).searchParams.get("issue");
  if (!issue) return badRequest;
  addIssue(issue);
  return ok;
};
var fetchVocabulary = () => jsonResponse(Object.keys(vocabulary));
var fetchSearch = async (req) => {
  const word = new URL(req.url).searchParams.get("word");
  if (!word) return badRequest;
  return jsonResponse(await getTask(word) ?? newTask(word, now()));
};
var init2 = async () => {
  await init();
  const res = await fetch(VOCABULARY_URL, { cache: "force-cache" });
  const delimiter = /[,:] */;
  if (res.ok) {
    for (let line of (await res.text()).split("\n")) if (line = line.trim()) {
      const [word, ...tags] = line.split(delimiter).map((w) => w.trim());
      vocabulary[word] = tags;
    }
  }
  const _vocabulary_url = await getKv("_vocabulary-url");
  if (VOCABULARY_URL !== _vocabulary_url && Object.keys(vocabulary).length > 2e4) {
    await clarifyTask();
    await clarifyDiction();
    await setKv("_vocabulary-url", VOCABULARY_URL);
  }
  await syncSetting();
  await syncTasks();
  sendMessage({ type: "stats", data: g2.stats = await totalStats() });
};
init2();
