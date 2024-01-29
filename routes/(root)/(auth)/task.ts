// deno-lint-ignore-file no-explicit-any
import { Handlers } from "$fresh/server.ts";
import { ITask } from "../../../lib/itask.ts";
import { MemState, badRequest, internalServerError, jsonHeader } from "../../../lib/mem-server.ts";
import mongorun from '../../../lib/mongo.ts';
import { Int32 } from "mongodb";

export const handler: Handlers<any, MemState> = {
    async POST(req, ctx) {
        const lastgt = +new URL(req.url).searchParams.get('lastgt')!;
        const ntasks = await req.json() as Array<ITask>;
        const otasks: ITask[] = [];
        try { await mongorun(async client => {
            const collection = client.db('task').collection(ctx.state.user);
            const cursor = collection.find({ last: { $gt: lastgt } });
            for await (const task of cursor) otasks.push(task as any);
            for (const ntask of ntasks) {
                const filter = { type: ntask.type, word: ntask.word };
                const otask = (await collection.findOne(filter)) as ITask | null;
                if (!otask) {
                    await collection.insertOne(ntask);
                }
                else if (ntask.last > otask.last) {
                    const $set = { last: new Int32(ntask.last), next: new Int32(ntask.next), level: new Int32(ntask.level) };
                    await collection.updateOne(filter, { $set })
                }
            }
        })} catch { return internalServerError }
        return new Response(JSON.stringify(otasks), { headers: jsonHeader });
    },
    async DELETE(req, ctx) {
        const params = new URL(req.url).searchParams;
        const rawType = params.get('type');
        const rawWord = params.get('word');
        if (!rawType || !rawWord) return badRequest;
        const type = decodeURIComponent(rawType);
        const word = decodeURIComponent(rawWord);
        let result;
        try { await mongorun(async client => {
            const collection = client.db('task').collection(ctx.state.user);
            result = await collection.deleteOne({ type, word });
        })} catch { return internalServerError }
        return new Response(JSON.stringify(result), { headers: jsonHeader });
    }
};
