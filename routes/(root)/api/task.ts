// deno-lint-ignore-file no-explicit-any
import { Handlers } from "$fresh/server.ts";
import { internalServerError, jsonResponse } from '@sholvoir/generic/http';
import { Int32 } from "mongodb";
import { ITask } from "../../../lib/itask.ts";
import { MemState } from "../../../lib/fresh.ts";
import mongorun from '../../../lib/mongo.ts';

export const handler: Handlers<any, MemState> = {
    async POST(req, ctx) {
        const lastgt = +new URL(req.url).searchParams.get('lastgt')!;
        const clientTasks: Array<ITask> = await req.json();
        const serverTasks: ITask[] = [];
        try { await mongorun(async client => {
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
        })} catch (e) { console.error(e); return internalServerError; }
        console.log(`API '/task' POST ${ctx.state.user} ${lastgt} with tasks ${clientTasks.length}, return ${serverTasks.length}.`);
        return jsonResponse(serverTasks);
    },
    async DELETE(req, ctx) {
        const words: Array<string> = await req.json();
        let deleteResult;
        try { await mongorun(async client => {
            const collection = client.db('task').collection(ctx.state.user);
            deleteResult = await collection.deleteMany({ word: {$in: words} });
        })} catch (e) { console.error(e); return internalServerError; }
        console.log(`API '/task' DELETE ${ctx.state.user} with tasks ${words.length}.`);
        return jsonResponse(deleteResult);
    }
};
