// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const encoder = new TextEncoder();
function getTypeName(value) {
    const type = typeof value;
    if (type !== "object") {
        return type;
    } else if (value === null) {
        return "null";
    } else {
        return value?.constructor?.name ?? "object";
    }
}
function validateBinaryLike(source) {
    if (typeof source === "string") {
        return encoder.encode(source);
    } else if (source instanceof Uint8Array) {
        return source;
    } else if (source instanceof ArrayBuffer) {
        return new Uint8Array(source);
    }
    throw new TypeError(`The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`);
}
const base64abc = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/"
];
function encodeBase64(data) {
    const uint8 = validateBinaryLike(data);
    let result = "", i;
    const l = uint8.length;
    for(i = 2; i < l; i += 3){
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2 | uint8[i] >> 6];
        result += base64abc[uint8[i] & 0x3f];
    }
    if (i === l + 1) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2];
        result += "=";
    }
    return result;
}
function decodeBase64(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i = 0; i < size; i++){
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}
function addPaddingToBase64url(base64url) {
    if (base64url.length % 4 === 2) return base64url + "==";
    if (base64url.length % 4 === 3) return base64url + "=";
    if (base64url.length % 4 === 1) {
        throw new TypeError("Illegal base64url string!");
    }
    return base64url;
}
function convertBase64urlToBase64(b64url) {
    if (!/^[-_A-Z0-9]*?={0,2}$/i.test(b64url)) {
        throw new TypeError("Failed to decode base64url: invalid character");
    }
    return addPaddingToBase64url(b64url).replace(/\-/g, "+").replace(/_/g, "/");
}
function convertBase64ToBase64url(b64) {
    return b64.endsWith("=") ? b64.endsWith("==") ? b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -2) : b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -1) : b64.replace(/\+/g, "-").replace(/\//g, "_");
}
const encode = encodeBase64Url;
const decode = decodeBase64Url;
function encodeBase64Url(data) {
    return convertBase64ToBase64url(encodeBase64(data));
}
function decodeBase64Url(b64url) {
    return decodeBase64(convertBase64urlToBase64(b64url));
}
const mod = {
    encode: encode,
    decode: decode,
    encodeBase64Url: encodeBase64Url,
    decodeBase64Url: decodeBase64Url
};
new TextEncoder();
const decoder = new TextDecoder();
function is3Tuple(arr) {
    return arr.length === 3;
}
function decode1(jwt) {
    try {
        const arr = jwt.split(".").map(mod.decode).map((uint8Array, index)=>index === 0 || index === 1 ? JSON.parse(decoder.decode(uint8Array)) : uint8Array);
        if (is3Tuple(arr)) return arr;
        else throw new Error();
    } catch  {
        throw Error("The serialization of the jwt is invalid.");
    }
}
const TaskTypes = [
    'L',
    'R'
];
const Tags = [
    'OG',
    'MC',
    'LD',
    'S1',
    'S2',
    'S3',
    'W1',
    'W2',
    'W3',
    'VA',
    'WK',
    'A1',
    'A2',
    'B1',
    'B2',
    'C1',
    'L1',
    'L2',
    'L3',
    'L4',
    'L5',
    'GL',
    'GS',
    'AW',
    'TS',
    'BS',
    'DL',
    'FE',
    'CA',
    'BN',
    'ZK',
    'GK',
    'KY',
    'T4',
    'T6',
    'TF',
    'IS',
    'ST',
    'GR',
    'GM',
    'BE'
];
const BLevels = [
    'never',
    'start',
    'medium',
    'familiar',
    'skilled',
    'finished'
];
const STATUS_CODE = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    OK: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInfo: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    IMUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    ContentTooLarge: 413,
    URITooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    Teapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HTTPVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511
};
({
    [STATUS_CODE.Accepted]: "Accepted",
    [STATUS_CODE.AlreadyReported]: "Already Reported",
    [STATUS_CODE.BadGateway]: "Bad Gateway",
    [STATUS_CODE.BadRequest]: "Bad Request",
    [STATUS_CODE.Conflict]: "Conflict",
    [STATUS_CODE.Continue]: "Continue",
    [STATUS_CODE.Created]: "Created",
    [STATUS_CODE.EarlyHints]: "Early Hints",
    [STATUS_CODE.ExpectationFailed]: "Expectation Failed",
    [STATUS_CODE.FailedDependency]: "Failed Dependency",
    [STATUS_CODE.Forbidden]: "Forbidden",
    [STATUS_CODE.Found]: "Found",
    [STATUS_CODE.GatewayTimeout]: "Gateway Timeout",
    [STATUS_CODE.Gone]: "Gone",
    [STATUS_CODE.HTTPVersionNotSupported]: "HTTP Version Not Supported",
    [STATUS_CODE.IMUsed]: "IM Used",
    [STATUS_CODE.InsufficientStorage]: "Insufficient Storage",
    [STATUS_CODE.InternalServerError]: "Internal Server Error",
    [STATUS_CODE.LengthRequired]: "Length Required",
    [STATUS_CODE.Locked]: "Locked",
    [STATUS_CODE.LoopDetected]: "Loop Detected",
    [STATUS_CODE.MethodNotAllowed]: "Method Not Allowed",
    [STATUS_CODE.MisdirectedRequest]: "Misdirected Request",
    [STATUS_CODE.MovedPermanently]: "Moved Permanently",
    [STATUS_CODE.MultiStatus]: "Multi Status",
    [STATUS_CODE.MultipleChoices]: "Multiple Choices",
    [STATUS_CODE.NetworkAuthenticationRequired]: "Network Authentication Required",
    [STATUS_CODE.NoContent]: "No Content",
    [STATUS_CODE.NonAuthoritativeInfo]: "Non Authoritative Info",
    [STATUS_CODE.NotAcceptable]: "Not Acceptable",
    [STATUS_CODE.NotExtended]: "Not Extended",
    [STATUS_CODE.NotFound]: "Not Found",
    [STATUS_CODE.NotImplemented]: "Not Implemented",
    [STATUS_CODE.NotModified]: "Not Modified",
    [STATUS_CODE.OK]: "OK",
    [STATUS_CODE.PartialContent]: "Partial Content",
    [STATUS_CODE.PaymentRequired]: "Payment Required",
    [STATUS_CODE.PermanentRedirect]: "Permanent Redirect",
    [STATUS_CODE.PreconditionFailed]: "Precondition Failed",
    [STATUS_CODE.PreconditionRequired]: "Precondition Required",
    [STATUS_CODE.Processing]: "Processing",
    [STATUS_CODE.ProxyAuthRequired]: "Proxy Auth Required",
    [STATUS_CODE.ContentTooLarge]: "Content Too Large",
    [STATUS_CODE.RequestHeaderFieldsTooLarge]: "Request Header Fields Too Large",
    [STATUS_CODE.RequestTimeout]: "Request Timeout",
    [STATUS_CODE.URITooLong]: "URI Too Long",
    [STATUS_CODE.RangeNotSatisfiable]: "Range Not Satisfiable",
    [STATUS_CODE.ResetContent]: "Reset Content",
    [STATUS_CODE.SeeOther]: "See Other",
    [STATUS_CODE.ServiceUnavailable]: "Service Unavailable",
    [STATUS_CODE.SwitchingProtocols]: "Switching Protocols",
    [STATUS_CODE.Teapot]: "I'm a teapot",
    [STATUS_CODE.TemporaryRedirect]: "Temporary Redirect",
    [STATUS_CODE.TooEarly]: "Too Early",
    [STATUS_CODE.TooManyRequests]: "Too Many Requests",
    [STATUS_CODE.Unauthorized]: "Unauthorized",
    [STATUS_CODE.UnavailableForLegalReasons]: "Unavailable For Legal Reasons",
    [STATUS_CODE.UnprocessableEntity]: "Unprocessable Entity",
    [STATUS_CODE.UnsupportedMediaType]: "Unsupported Media Type",
    [STATUS_CODE.UpgradeRequired]: "Upgrade Required",
    [STATUS_CODE.UseProxy]: "Use Proxy",
    [STATUS_CODE.VariantAlsoNegotiates]: "Variant Also Negotiates"
});
const jsonHeader = new Headers([
    [
        'Content-Type',
        'application/json'
    ]
]);
new Response(undefined, {
    status: STATUS_CODE.Forbidden
});
new Response(undefined, {
    status: STATUS_CODE.InternalServerError
});
function d(r) {
    for(var t = 1; t < arguments.length; t++){
        var f = arguments[t];
        for(var p in f)r[p] = f[p];
    }
    return r;
}
var g = {
    read: function(r) {
        return r[0] === '"' && (r = r.slice(1, -1)), r.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    },
    write: function(r) {
        return encodeURIComponent(r).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
    }
};
function s(r, t) {
    function f(n, c, e) {
        if (!(typeof document > "u")) {
            e = d({}, t, e), typeof e.expires == "number" && (e.expires = new Date(Date.now() + e.expires * 864e5)), e.expires && (e.expires = e.expires.toUTCString()), n = encodeURIComponent(n).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
            var o = "";
            for(var i in e)e[i] && (o += "; " + i, e[i] !== !0 && (o += "=" + e[i].split(";")[0]));
            return document.cookie = n + "=" + r.write(c, n) + o;
        }
    }
    function p(n) {
        if (!(typeof document > "u" || arguments.length && !n)) {
            for(var c = document.cookie ? document.cookie.split("; ") : [], e = {}, o = 0; o < c.length; o++){
                var i = c[o].split("="), v = i.slice(1).join("=");
                try {
                    var u = decodeURIComponent(i[0]);
                    if (e[u] = r.read(v, u), n === u) break;
                } catch  {}
            }
            return n ? e[n] : e;
        }
    }
    return Object.create({
        set: f,
        get: p,
        remove: function(n, c) {
            f(n, "", d({}, c, {
                expires: -1
            }));
        },
        withAttributes: function(n) {
            return s(this.converter, d({}, this.attributes, n));
        },
        withConverter: function(n) {
            return s(d({}, this.converter, n), this.attributes);
        }
    }, {
        attributes: {
            value: Object.freeze(t)
        },
        converter: {
            value: Object.freeze(r)
        }
    });
}
var C = s(g, {
    path: "/"
});
const vocabularyUrl = 'https://www.sholvoir.com/vocabulary/0.0.1/vocabulary.json';
const dictApi = 'https://dict.sholvoir.com/api';
const taskApi = '/api';
const times = [
    60000,
    300000,
    1800000,
    5400000,
    21600000,
    86400000,
    151200000,
    259200000,
    604800000,
    1123200000,
    2160000000,
    4233600000,
    8380800000,
    16502400000,
    31708800000
];
const fetchInit = (body, method = 'POST')=>({
        method,
        headers: jsonHeader,
        body: JSON.stringify(body)
    });
const toBLevel = (level)=>{
    if (level > 15) return 'finished';
    if (level > 13) return 'skilled';
    if (level > 10) return 'familiar';
    if (level > 6) return 'medium';
    if (level > 0) return 'start';
    return 'never';
};
const study = async (task)=>{
    task.next = (task.last = Date.now()) + times[task.level++];
    await putTask(task);
};
const getEpisode = async (taskType, tag, blevel)=>{
    const tasks = [];
    const ctime = Date.now();
    await traversingTask((cursor)=>{
        const task = cursor.value;
        if (taskType && task.type != taskType) return true;
        if (tag && !vocabulary[task.word].includes(tag)) return true;
        if (blevel && toBLevel(task.level) != blevel) return true;
        tasks.push(task);
        return tasks.length < 20;
    }, 'next', IDBKeyRange.upperBound(ctime), "prev");
    return tasks;
};
let _db;
let vocabulary;
const getAuth = ()=>C.get('auth');
const removeAuth = ()=>C.remove('auth');
const getUser = ()=>{
    const token = getAuth();
    if (token) try {
        const [_, payload] = decode1(token);
        return payload.aud;
    } catch  {}
};
const setSyncTime = (time)=>localStorage.setItem('_sync-time', `${time}`);
const getSyncTime = ()=>+(localStorage.getItem('_sync-time') ?? 0);
const openDatabase = ()=>new Promise((resolve, reject)=>{
        const email = getUser();
        if (!email) return reject('Login first!');
        const userId = btoa(email).replaceAll('=', '');
        const request = indexedDB.open(userId, 1);
        let needInitData = false;
        request.onerror = ()=>{
            console.error(`Database Error: ${request.error}.`);
            reject(request.error);
        };
        request.onsuccess = ()=>{
            _db = request.result;
            resolve(needInitData);
        };
        request.onupgradeneeded = ()=>{
            const taskStore = request.result.createObjectStore('task', {
                keyPath: [
                    'type',
                    'word'
                ]
            });
            taskStore.createIndex('type_word', [
                'type',
                'word'
            ], {
                unique: true
            });
            taskStore.createIndex('last', 'last');
            taskStore.createIndex('next', 'next');
            setSyncTime(0);
            needInitData = true;
        };
    });
const closeDatabase = ()=>{
    _db?.close();
};
const getTasksByGtLast = (last)=>new Promise((resolve, reject)=>{
        if (!_db) return reject('Open Database First!');
        const request = _db.transaction('task', 'readonly').objectStore('task').index('last').getAll(IDBKeyRange.lowerBound(last, true));
        request.onsuccess = ()=>resolve(request.result);
        request.onerror = (e)=>reject(e);
    });
const putTask = (task)=>new Promise((resolve, reject)=>{
        if (!_db) return reject('Open Database First!');
        const request = _db.transaction('task', 'readwrite').objectStore('task').put(task);
        request.onsuccess = ()=>resolve(request.result);
        request.onerror = (e)=>reject(e);
    });
const putTasks = (tasks)=>new Promise((resolve, reject)=>{
        if (!_db) return reject('Open Database First!');
        const transaction = _db.transaction('task', 'readwrite');
        const objectStore = transaction.objectStore('task');
        for (const task of tasks)objectStore.put(task);
        transaction.oncomplete = ()=>resolve();
        transaction.onerror = (e)=>reject(e);
    });
const traversingTask = (each, indexName, query, direction)=>new Promise((resolve, reject)=>{
        if (!_db) return reject('Open Database First!');
        const objectStore = _db.transaction('task', 'readonly').objectStore('task');
        const request = indexName ? objectStore.index(indexName).openCursor(query, direction) : objectStore.openCursor(query, direction);
        request.onerror = (error)=>reject(error);
        request.onsuccess = ()=>{
            const cursor = request.result;
            if (!cursor) return resolve();
            if (each(cursor)) cursor.continue();
            else resolve();
        };
    });
const initStats = ()=>{
    const stats = {};
    for (const taskType of TaskTypes){
        stats[taskType] = {};
        for (const tag of Tags){
            stats[taskType][tag] = {
                all: {},
                task: {}
            };
            for (const blevel of BLevels){
                stats[taskType][tag].all[blevel] = 0;
                stats[taskType][tag].task[blevel] = 0;
            }
        }
    }
    return stats;
};
const updateStats = async ()=>{
    const stats = initStats();
    const ctime = Date.now();
    await traversingTask((cursor)=>{
        const task = cursor.value;
        const blevel = toBLevel(task.level);
        const tags = vocabulary[task.word];
        if (tags) for (const tag of tags){
            const stat = stats[task.type][tag];
            stat.all[blevel]++;
            if (task.next < ctime) stat.task[blevel]++;
        }
        return true;
    });
    return stats;
};
const signup = async (email)=>{
    const resp = await fetch(`/signup?email=${encodeURIComponent(email)}`);
    if (!resp.ok) throw new Error(`Error: ${await resp.text()}`);
};
const getDict = async (word)=>{
    const resp = await fetch(`${dictApi}/${encodeURIComponent(word)}`);
    if (!resp.ok) throw new Error(`Error: ${await resp.text()}`);
    return await resp.json();
};
const updateTask = async (task)=>await fetch(`${taskApi}/task/${task.word}`, fetchInit(task, 'PUT'));
const initVocabulary = async ()=>{
    const opfsRoot = await navigator.storage.getDirectory();
    try {
        vocabulary = JSON.parse(await (await (await opfsRoot.getFileHandle('vocabulary.json')).getFile()).text());
    } catch  {
        const resp = await fetch(vocabularyUrl);
        if (!resp.ok) throw new Error('Network Error, Can not download init data!');
        const vocabularyString = await resp.text();
        vocabulary = JSON.parse(vocabularyString);
        const fileStream = await (await opfsRoot.getFileHandle('vocabulary.json', {
            create: true
        })).createWritable();
        await fileStream.write(vocabularyString);
        await fileStream.close();
    }
};
const initTasks = async ()=>{
    if (!vocabulary) throw new Error('Please Init Vocabulary First!');
    const tasks = [];
    for(const word in vocabulary)for (const type of TaskTypes)tasks.push({
        type,
        word,
        last: 0,
        next: Number.MAX_SAFE_INTEGER,
        level: 0
    });
    await putTasks(tasks);
    console.log('done!');
};
const syncTasks = async ()=>{
    const syncTime = getSyncTime();
    const now = Date.now();
    const otasks = await getTasksByGtLast(syncTime);
    const resp = await fetch(`${taskApi}/task?lastgt=${syncTime}`, fetchInit(otasks));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await putTasks(ntasks);
    setSyncTime(now);
};
export { study as study };
export { getEpisode as getEpisode };
export { getAuth as getAuth };
export { removeAuth as removeAuth };
export { getUser as getUser };
export { setSyncTime as setSyncTime };
export { getSyncTime as getSyncTime };
export { openDatabase as openDatabase };
export { closeDatabase as closeDatabase };
export { traversingTask as traversingTask };
export { initStats as initStats };
export { updateStats as updateStats };
export { signup as signup };
export { getDict as getDict };
export { updateTask as updateTask };
export { initVocabulary as initVocabulary };
export { initTasks as initTasks };
export { syncTasks as syncTasks };
