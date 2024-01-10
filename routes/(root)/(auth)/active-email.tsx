import { internalServerError, MemContext } from "../../../lib/mem-server.ts";
import { setAuth } from "../../../lib/jwt.ts";

const mongoDDL = 'https://mongo-ddl.deno.dev';
const requestInit: RequestInit = {
    method: 'POST',
    headers: new Headers([
        ['Content-Type', 'application/json'],
        ['Authorization', `Bearer ${Deno.env.get('MONGO_TOKEN')}`]
    ])
}
const indexInfo = {
    database: 'task',
    collection: '',
    indexes: [
        { key: { type: 1, word: 1 }, name: 'type_word', unique: true },
        { key: { last: 1 }, name: 'last' }
    ]
}

export const handler = async (_req: Request, ctx: MemContext) => {
    requestInit.body = JSON.stringify({ database: 'task' });
    const resp1 = await fetch(`${mongoDDL}/get-collection-names`, requestInit);
    if (!(resp1).ok) return internalServerError;
    const collections = await resp1.json() as Array<string>;
    if (!collections.includes(ctx.state.collection)) {
        indexInfo.collection = ctx.state.collection;
        requestInit.body = JSON.stringify(indexInfo);
        const resp2 = await fetch(`${mongoDDL}/create-index`, requestInit);
        if (!(resp2).ok) return internalServerError;
    }
    return await setAuth(await ctx.render(), ctx.state.user as string );
}

export default () => <script>window.location.assign('/')</script>;