// deno-lint-ignore-file no-explicit-any
import { MemState, notFound } from '../../../lib/mem-server.ts';
import { Handlers } from "$fresh/server.ts";
import { ISetting } from "../../../lib/isetting.ts";
import { jsonHeader, ok, internalServerError } from "../../../lib/mem-server.ts";

const catalog = 'setting';

export const handler: Handlers<any, MemState> = {
    async GET(_req, ctx) {
        try {
            const kv = await Deno.openKv();
            const res = await kv.get([catalog, ctx.state.user]);
            const value = res.value as ISetting;
            kv.close();
            if (!value) return notFound;
            return new Response(JSON.stringify(value), { headers: jsonHeader });
        } catch { return internalServerError; }
    },
    async PUT(req, ctx) {
        try {
            const setting = await req.json() as ISetting;
            const kv = await Deno.openKv();
            await kv.set([catalog, ctx.state.user], setting);
            kv.close();
            return ok;
        } catch { return internalServerError; }
    },
    async DELETE(_req, ctx) {
        try {
            const kv = await Deno.openKv();
            await kv.delete([catalog, ctx.state.user]);
            kv.close();
            return ok;
        } catch { return internalServerError; }
    }
};