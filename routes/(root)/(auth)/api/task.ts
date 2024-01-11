// deno-lint-ignore-file no-explicit-any
import { ITask } from "../../../../lib/itask.ts";
import { MemContext, internalServerError, jsonHeader } from "../../../../lib/mem-server.ts";
import mongorun from '../../../../lib/mongo.ts';

export const handler = async (req: Request, ctx: MemContext) => {
    const lastgt = +new URL(req.url).searchParams.get('lastgt')!;
    const ntasks = await req.json() as Array<ITask>;
    const result: ITask[] = [];
    try { await mongorun(async client => {
        const collection = client.db('task').collection(ctx.state.collection);
        const cursor = collection.find({ last: { $gt: lastgt } });
        for await (const task of cursor) result.push(task as any);
        for (const ntask of ntasks) {
            const filter = { type: ntask.type, word: ntask.word };
            const otask = (await collection.findOne(filter)) as ITask|null;
            if (!otask) {
                await collection.insertOne(ntask);
            }
            else if (ntask.last > otask.last) {
                const $set = { last: ntask.last, next: ntask.next, level: ntask.level };
                await collection.updateOne(filter, { $set })
            }
        }
    })} catch { return internalServerError; }
    return new Response(JSON.stringify(result), { headers: jsonHeader });
};
