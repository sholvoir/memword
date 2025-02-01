import { Handlers } from "$fresh/server.ts";
import { emptyResponse, STATUS_CODE } from '@sholvoir/generic/http';
import { IDict } from "../../../../../lib/idict.ts";

const category = 'dict';
const kvPath = Deno.env.get('DENO_KV_PATH');

const getWordN = (url: string) => new URL(url).searchParams.get('q');

export const handler: Handlers = {
    async PUT(req) {
        try {
            const wordN = getWordN(req.url);
            if (!wordN) return emptyResponse(STATUS_CODE.BadRequest);
            const kv = await Deno.openKv(kvPath);
            const value = await req.json();
            await kv.set([category, wordN], value);
            kv.close();
            return emptyResponse();
        } catch (e) {
            console.error(e);
            return emptyResponse(STATUS_CODE.InternalServerError);
        }
    },
    async PATCH(req) {
        try {
            const wordN = getWordN(req.url);
            if (!wordN) return emptyResponse(STATUS_CODE.BadRequest);;
            const kv = await Deno.openKv(kvPath);
            const value = await req.json();
            const key = [category, wordN];
            const res = await kv.get(key);
            await kv.set(key, {...(res.value as IDict), ...value});
            kv.close();
            return emptyResponse();
        } catch (e) {
            console.error(e);
            return emptyResponse(STATUS_CODE.InternalServerError);
        }
    },
    async DELETE(req) {
        try {
            const wordN = getWordN(req.url);
            if (!wordN) return emptyResponse(STATUS_CODE.BadRequest);;
            const kv = await Deno.openKv(kvPath);
            const key = [category, wordN];
            const res = await kv.get(key);
            if (res.value) {
                await kv.delete(key);
                kv.close();
                return emptyResponse();
            } else {
                kv.close();
                return emptyResponse(STATUS_CODE.NotFound);
            }
        } catch (e) {
            console.error(e);
            return emptyResponse(STATUS_CODE.InternalServerError);
        }
    }
};
