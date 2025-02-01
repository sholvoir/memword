// deno-lint-ignore-file no-explicit-any
import { Handlers } from "$fresh/server.ts";
import { MemState, MONGO_URI } from "../../../../lib/fresh.ts";
import { emptyResponse, jsonResponse, STATUS_CODE } from '@sholvoir/generic/http';
import { mongoRun } from '@sholvoir/generic/mongo';
import { Int32 } from "mongodb";
import { ITask } from "../../../../lib/itask.ts";

export const handler: Handlers<any, MemState> = {
    async POST(req, ctx) {
        try {
            const lastgt = +new URL(req.url).searchParams.get('lastgt')!;
            const clientTasks: Array<ITask> = await req.json();
            const serverTasks: ITask[] = [];
            await mongoRun(MONGO_URI, async client => {
                const collection = client.db('task').collection(ctx.state.user);
                const cursor = collection.find({ last: { $gte: lastgt } });
                for await (const task of cursor) serverTasks.push(task as any);
                for (const ctask of clientTasks) {
                    const filter = { word: ctask.word };
                    const otask = (await collection.findOne(filter)) as ITask | null;
                    if (!otask) {
                        await collection.insertOne(ctask);
                    } else if (ctask.last > otask.last) {
                        const $set = { last: new Int32(ctask.last), next: new Int32(ctask.next), level: new Int32(ctask.level) };
                        await collection.updateOne(filter, { $set });
                    }
                }
            });
            console.log(`API '/task' POST ${ctx.state.user} ${lastgt} with tasks ${clientTasks.length}, return ${serverTasks.length}.`);
            return jsonResponse(serverTasks);
        } catch (e) {
            console.error(e);
            return emptyResponse(STATUS_CODE.InternalServerError);
        }
    },
    async DELETE(req, ctx) {
        
        try {
            const words: Array<string> = await req.json();
            const deleteResult = await mongoRun(MONGO_URI, async client => {
                const collection = client.db('task').collection(ctx.state.user);
                return await collection.deleteMany({ word: { $in: words } });
            });
            console.log(`API '/task' DELETE ${ctx.state.user} with tasks ${words.length}.`);
            return jsonResponse(deleteResult);
        } catch (e) {
            console.error(e);
            return emptyResponse(STATUS_CODE.InternalServerError);
        }
    }
};
