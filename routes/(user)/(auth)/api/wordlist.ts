// deno-lint-ignore-file no-explicit-any no-cond-assign
import { B2_BASE_URL } from "../../../../lib/common.ts";
import { Handlers } from "$fresh/server.ts";
import { emptyResponse, jsonResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { mongoRun } from '@sholvoir/generic/mongo';
import { versionpp } from "@sholvoir/generic/versionpp";
import { MemState, MONGO_URI } from '../../../../lib/fresh.ts';
import { IWordList } from "../../../../lib/wordlist.ts";
import { Client as MinioClient } from 'minio';

const b2bucket = 'vocabulary';
const minioClient = new MinioClient({
    endPoint: 's3.us-east-005.backblazeb2.com',
    useSSL: true,
    accessKey: Deno.env.get('BACKBLAZE_KEY_ID'),
    secretKey: Deno.env.get('BACKBLAZE_APP_KEY')
});

const entitiesRegex = /&(quot|apos|amp|lt|gt|#(x?\d+));/g;
const markRegex = /<.*?>/g;
// const spliteNum = /^([A-Za-zèé /&''.-]+)(\d*)/;
const entities: Record<string, string> = { quot: '"', apos: "'", amp: '&', lt: '<', gt: '>' };
const decodeEntities = (_: string, p1: string, p2: string) => p2 ? String.fromCharCode(+`0${p2}`) : entities[p1];
const reqInit = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0' } }

const vocabularyWlid = 'system/vocabulary';
const vocabularySet = new Set<string>();
let vocabularyVersion: string | undefined;

const spellCheckWlid = 'system/spell-check';
const spellCheckSet = new Set<string>();
let spellCheckVersion: string | undefined;
let spellCheckAdded = false;

const spellCheckIgnoreWlid = 'system/spell-check-ignore';
const spellCheckIgnoreSet = new Set<string>();
let currentSpellCheckIgnoreVersion: string;
let functionIndex = 0;

const getScfunc = (baseUri: string, regexes: Array<[RegExp, number]>) => async (word: string) => {
    try {
        const result = [];
        const html = await (await fetch(`${baseUri}${encodeURIComponent(word)}`, reqInit)).text();
        for (const [regex, index] of regexes)
            for (const match of html.matchAll(regex))
                result.push(match[index ?? 1].trim().replaceAll(entitiesRegex, decodeEntities).replaceAll(markRegex, ''));
        return result;
    } catch (e) { return (console.log(e), []); }
};

const scfuncs = [
    getScfunc('https://www.merriam-webster.com/dictionary/',
        [[/<(?:h1|p) class="hword">(?:<span.*?>)?(.+?)(?:<\/span>)?<\/(?:h1|p)>/g, 1],
        [/<span class="fw-bold ure">(.+?)<\/span>/g, 1],
        [/<span id=".*?" class="va">(.+?)<\/span>/g, 1]]),
    getScfunc('https://www.oxfordlearnersdictionaries.com/us/search/english/?q=',
        [[/<h1 class="headword".*?>(.+?)<\/h1>/g, 1]]),
    getScfunc('https://www.dictionary.com/browse/',
        [[/<(p|h1) class="(?:elMfuCTjKMwxtSEEnUsi)?">(.*?)<\/\1>/g, 2]])
];

const spellCheck = async (word: string): Promise<string[] | undefined> => {
    let [rword] = word.split('_');
    if (rword = rword.trim()) {
        if (spellCheckIgnoreSet.has(rword)) return;
        if (spellCheckSet.has(rword)) return;
        const replaces = new Set<string>();
        for (let i = 0; i < scfuncs.length; i++) {
            const funIndex = functionIndex++ % scfuncs.length;
            const entries = await scfuncs[funIndex](rword);
            if (entries.includes(rword)) { spellCheckSet.add(rword); spellCheckAdded = true; return; }
            else entries.forEach(entry => replaces.add(entry));
        }
        return Array.from(replaces);
    }
}

export const handler: Handlers<any, MemState> = {
    async GET(req) {
        
        try {
            const wlid = new URL(req.url).searchParams.get('wlid');
            if (!wlid) return emptyResponse(STATUS_CODE.BadRequest);
            const wl = await mongoRun(MONGO_URI, async (client) => {
                const collection = client.db('wordlist').collection<IWordList>('wordlist');
                return await collection.findOne({ wlid });
            });
            if (!wl) return emptyResponse(STATUS_CODE.NotFound);
            delete wl._id;
            return jsonResponse(wl);
        } catch { return emptyResponse(STATUS_CODE.InternalServerError); }
    },
    async POST(req, ctx) {
        try {
            const user = ctx.state.user
            const name = new URL(req.url).searchParams.get('name');
            if (!name) return emptyResponse(STATUS_CODE.BadRequest);
            const wlid = `${user}/${name}`;
            const text = await req.text();
            if (!text.length) return emptyResponse(STATUS_CODE.BadRequest);
            return await mongoRun(MONGO_URI, async client => {
                const collection = client.db('wordlist').collection<IWordList>('wordlist');
                if (!vocabularySet.size) { // vocabulary
                    vocabularyVersion = (await collection.findOne({ wlid: vocabularyWlid }))?.version;
                    if (!vocabularyVersion) await collection.insertOne({ wlid: vocabularyWlid, version: (vocabularyVersion = '0.0.1') });
                    const res = await fetch(`${B2_BASE_URL}/${vocabularyWlid}-${vocabularyVersion}.txt`);
                    if (!res.ok) throw new Error('Network Error!');
                    for (let line of (await res.text()).split('\n')) if (line = line.trim()) vocabularySet.add(line);
                }
                if (!spellCheckSet.size) {// spell-check
                    spellCheckVersion = (await collection.findOne({ wlid: spellCheckWlid }))?.version ?? '0.0.1';
                    if (!spellCheckVersion) await collection.insertOne({ wlid: spellCheckWlid, version: (spellCheckVersion = '0.0.1') });
                    const res = await fetch(`${B2_BASE_URL}/${spellCheckWlid}-${spellCheckVersion}.txt`);
                    if (!res.ok) throw new Error('Network Error!');
                    for (let line of (await res.text()).split('\n')) if (line = line.trim()) spellCheckSet.add(line);
                }
                // spell-check-ignore
                const spellCheckIgnoreVersion = (await collection.findOne({ wlid: spellCheckIgnoreWlid }))?.version ?? '0.0.1';
                if (currentSpellCheckIgnoreVersion !== spellCheckIgnoreVersion) {
                    const res = await fetch(`${B2_BASE_URL}/${spellCheckIgnoreWlid}-${spellCheckIgnoreVersion}.txt`);
                    if (!res.ok) throw new Error('Network Error!');
                    spellCheckIgnoreSet.clear();
                    for (let line of (await res.text()).split('\n')) if (line = line.trim()) spellCheckIgnoreSet.add(line);
                    currentSpellCheckIgnoreVersion = spellCheckIgnoreVersion;
                }

                const words = new Set<string>();
                const replaces: Record<string, Array<string>> = {};
                for (let line of text.split('\n')) if (line = line.trim()) {
                    const replace = await spellCheck(line);
                    if (!replace) words.add(line);
                    else replaces[line] = replace;
                }

                if (spellCheckAdded) {
                    spellCheckAdded = false;
                    const newSpellCheckVersion = versionpp(spellCheckVersion!);
                    await minioClient.putObject(b2bucket, `${spellCheckWlid}-${newSpellCheckVersion}.txt`,
                        Array.from(spellCheckSet).sort().join('\n'), 'text/plain');
                    await collection.updateOne({ wlid: spellCheckWlid }, { $set: { version: newSpellCheckVersion } });
                    await minioClient.removeObject(b2bucket, `spell-check-${spellCheckVersion}.txt`);
                    spellCheckVersion = newSpellCheckVersion;
                }

                if (Object.keys(replaces).length) {
                    console.log(`API '/wordlist' POST ${user}/${name}, spell check failed.`);
                    return jsonResponse(replaces);
                }

                const wordlist = await collection.findOne({ wlid });
                if (wordlist) {
                    const newVersion = versionpp(wordlist.version);
                    await minioClient.putObject(b2bucket, `${wlid}-${newVersion}.txt`,
                        Array.from(words).sort().join('\n'), 'text/plain');
                    await minioClient.removeObject(b2bucket, `${wlid}-${wordlist.version}.txt`);
                    await collection.updateOne({ wlid }, { $set: { version: newVersion } });
                } else {
                    const newVersion = '0.0.1';
                    await minioClient.putObject(b2bucket, `${wlid}-${newVersion}.txt`,
                        Array.from(words).sort().join('\n'), 'text/plain');
                    await collection.insertOne({ wlid, version: newVersion });
                }

                const oldSize = vocabularySet.size;
                for (const word of words) vocabularySet.add(word);
                const newSize = vocabularySet.size;
                if (newSize > oldSize) {
                    const newVocabularyVersion = versionpp(vocabularyVersion!);
                    await minioClient.putObject(b2bucket, `${vocabularyWlid}-${newVocabularyVersion}.txt`,
                        Array.from(vocabularySet).sort().join('\n'), 'text/plain');
                    await collection.updateOne({ wlid: vocabularyWlid }, { $set: { version: newVocabularyVersion } });
                    await minioClient.removeObject(b2bucket, `${vocabularyWlid}-${vocabularyVersion}.txt`);
                    vocabularyVersion = newVocabularyVersion;
                }
                console.log(`API '/wordlist' POST ${user}/${name}, successed.`);
                return emptyResponse();
            });
        } catch { return emptyResponse(STATUS_CODE.InternalServerError); }
    }
};