// deno-lint-ignore-file no-explicit-any
import { Handlers } from "$fresh/server.ts";
import { responseInit, ok, internalServerError } from "@sholvoir/generic/http";
import { MemState } from '../../../lib/fresh.ts';
import { ISetting } from "../../../lib/isetting.ts";

const catalog = 'setting';
const kvPath = Deno.env.get('DENO_KV_PATH');

export const handler: Handlers<any, MemState> = {
    async POST(req, ctx) {
        try {
            const newSetting = await req.json() as ISetting;
            const key = [catalog, ctx.state.user]
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get(key);
            const oldSetting = res.value as ISetting;
            if (newSetting.version > oldSetting.version)
                await kv.set(key, newSetting);
            kv.close();
            const setting = newSetting.version > oldSetting.version ? newSetting : oldSetting;
            console.log(`API '/setting' POST ${ctx.state.user}`);
            return new Response(JSON.stringify(setting), responseInit);
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