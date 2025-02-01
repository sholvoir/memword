import { Handlers } from "$fresh/server.ts";
import { emptyResponse, jsonResponse, STATUS_CODE } from '@sholvoir/generic/http';
import { IDict } from "../../../lib/idict.ts";
import fill from '../../../lib/fill-dict.ts';

const category = 'dict';
const kvPath = Deno.env.get('DENO_KV_PATH');

export const handler: Handlers = {
    async GET(req) {
        try {
            const wordN = new URL(req.url).searchParams.get('q');
            if (!wordN) return emptyResponse(STATUS_CODE.BadRequest);
            const word = wordN.split('_')[0];
            if (!word) return emptyResponse(STATUS_CODE.BadRequest);
            // Read
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get<IDict>([category, wordN]);
            const dict: IDict = res.value ?? {word};
            if (!dict.def || !dict.phonetic || !dict.sound || !dict.trans) await fill(dict);
            // Write
            if (dict.modified && res.value) {
                delete dict.modified;
                await kv.set([category, wordN], dict);
            }
            kv.close();
            delete dict.modified;
            return jsonResponse(dict);
        } catch (e) {
            console.error(e);
            return emptyResponse(STATUS_CODE.InternalServerError);
        }
    }
};
