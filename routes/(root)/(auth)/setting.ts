// deno-lint-ignore-file no-explicit-any
import { MemState } from '../../../lib/mem-server.ts';
import { Handlers } from "$fresh/server.ts";
import { ISetting } from "../../../lib/isetting.ts";
import mongorun from "../../../lib/mongo.ts";

export const handler: Handlers<any, MemState> = {
    async POST(req, ctx) {
        const setting = await req.json() as ISetting;
        await mongorun(async (client) => {
            await client.db('user').collection('setting').updateOne({ user: ctx.state.user }, { $set: setting }, { upsert: true });
        });
        return new Response();
    }
};