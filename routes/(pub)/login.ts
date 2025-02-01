import { Handlers } from "$fresh/server.ts";
import { setAuth } from "../../lib/jwt.ts";
import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { mongoRun } from '@sholvoir/generic/mongo';
import { MONGO_URI } from "../../lib/fresh.ts";
import { IPass } from "../../lib/ipass.ts";
import { now } from "../../lib/common.ts";

const catalog = 'password';
const kvPath = Deno.env.get('DENO_KV_PATH');

export const handler: Handlers = {
    async POST(req) {
        try {
            const { email, password } = await req.json() as { email: string, password: string };
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get([catalog, email]);
            const pass = res.value as IPass;
            if (!pass) {
                kv.close();
                return emptyResponse(STATUS_CODE.BadRequest);
            }
            if (pass.expire < now()) {
                await kv.delete([catalog, email]);
                kv.close();
                return emptyResponse(STATUS_CODE.BadRequest);
            }
            if (pass.password != password) {
                kv.close();
                return emptyResponse(STATUS_CODE.BadRequest);
            }
            await mongoRun(MONGO_URI, async client => {
                const db = client.db('task');
                const collectionNames = (await db.collections()).map(conn => conn.collectionName);
                if (!collectionNames.includes(email)) {
                    const collection = await db.createCollection(email);
                    await collection.createIndex({ word: 1 }, { unique: true });
                    await collection.createIndex({ last: 1 });
                }
            });
            console.log(`API '/login' POST ${email}`);
            await kv.delete([catalog, email]);
            kv.close();
            return await setAuth(new Response(), email);
        } catch { return emptyResponse(STATUS_CODE.InternalServerError); }
    }
};
