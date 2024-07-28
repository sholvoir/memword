// deno-lint-ignore-file no-explicit-any
import { Handlers } from "$fresh/server.ts";
import { responseInit, ok, notFound, internalServerError } from "@sholvoir/generic/http";
import { MemState } from '../../../lib/server.ts';
import { ISetting } from "../../../lib/isetting.ts";

const catalog = 'setting';
const kvPath = Deno.env.get('DENO_KV_PATH');

export const handler: Handlers<any, MemState> = {
    async GET(_req, ctx) {
        try {
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get([catalog, ctx.state.user]);
            const value = res.value as ISetting;
            kv.close();
            if (!value) return notFound;
            console.log(`API '/setting' GET ${ctx.state.user}`)
            return new Response(JSON.stringify(value), responseInit);
        } catch { return internalServerError; }
    },
    async PUT(req, ctx) {
        try {
            const setting = await req.json() as ISetting;
            const kv = await Deno.openKv(kvPath);
            await kv.set([catalog, ctx.state.user], setting);
            kv.close();
            console.log(`API '/setting' PUT ${ctx.state.user}`);
            return ok;
        } catch { return internalServerError; }
    },
    async DELETE(_req, ctx) {
        try {
            const kv = await Deno.openKv(kvPath);
            await kv.delete([catalog, ctx.state.user]);
            kv.close();
            console.log(`API '/setting' DELETE ${ctx.state.user}`);
            return ok;
        } catch { return internalServerError; }
    }
};