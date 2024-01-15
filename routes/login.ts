import { Handlers } from "$fresh/server.ts";
import { setAuth } from "../lib/jwt.ts";
import mongorun from '../lib/mongo.ts';
import { badRequest, internalServerError } from "../lib/mem-server.ts";
import { IUser } from "../lib/iuser.ts";

export const handler: Handlers = {
    async POST(req) {
        const { email, password } = await req.json() as { email: string, password: string };
        const id = btoa(email).replaceAll('=', '');
        try {
            await mongorun(async client => {
                const user = await client.db('user').collection<IUser>('user').findOne({ name: id });
                if (!user || user.pass != password || user.expire < Math.round(Date.now() / 1000) + 5 * 60) return badRequest;
                const db = client.db('task');
                const collectionNames = (await db.collections()).map(conn => conn.collectionName);
                if (!collectionNames.includes(id)) {
                    const collection = await db.createCollection(id);
                    await collection.createIndex({ type: 1, word: 1 }, { unique: true });
                    await collection.createIndex({ last: 1 });
                }
            })
        } catch { return internalServerError; }
        return await setAuth(new Response(), id);
    },
};
