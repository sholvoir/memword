import { internalServerError, MemContext } from "../../../lib/mem-server.ts";
import { setAuth } from "../../../lib/jwt.ts";
import mongorun from '../../../lib/mongo.ts';

export const handler = async (_req: Request, ctx: MemContext) => {
    try { await mongorun(async client => {
        const db = client.db('task');
        const collectionNames = (await db.collections()).map(conn => conn.collectionName);
        if (!collectionNames.includes(ctx.state.collection)) {
            const collection = await db.createCollection(ctx.state.collection);
            await collection.createIndex({ type: 1, word: 1 }, { unique: true });
            await collection.createIndex({ last: 1 });
        }

    })} catch (e) { return internalServerError; }
    return await setAuth(await ctx.render(), ctx.state.user as string );
}

export default () => <script>window.location.assign('/')</script>;