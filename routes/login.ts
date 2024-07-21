import { Handlers } from "$fresh/server.ts";
import { setAuth } from "../lib/jwt.ts";
import { badRequest, internalServerError } from "../lib/mem-server.ts";
import { IPass } from "../lib/ipass.ts";
import mongorun from '../lib/mongo.ts';

const catalog = 'password';
const kvPath = Deno.env.get('DENO_KV_PATH');

export const handler: Handlers = {
    async POST(req) {
        try {
            const { email, password } = await req.json() as { email: string, password: string };
            const id = btoa(email).replaceAll('=', '');
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get([catalog, id]);
            const pass = res.value as IPass;
            if (!pass || pass.password != password || pass.expire < Math.round(Date.now() / 1000)) return badRequest;
            await mongorun(async client => {
                const db = client.db('task');
                const collectionNames = (await db.collections()).map(conn => conn.collectionName);
                if (!collectionNames.includes(id)) {
                    const collection = await db.createCollection(id);
                    await collection.createIndex({ type: 1, word: 1 }, { unique: true });
                    await collection.createIndex({ last: 1 });
                }
            });
            console.log(`API '/login' POST ${id}`);
            return await setAuth(new Response(), id);
        } catch { return internalServerError; }
    },
};
