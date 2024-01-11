// deno-lint-ignore-file no-explicit-any
import mongorun from './lib/mongo.ts';
import { ITask } from "./lib/itask.ts";

const vocabularyPath = '../sholvoir.github.io/vocabulary/0.0.1/vocabulary.json';
const oldTaskPath = './data/memword.json';
type OldTask = {level: number, hard: number, last: number, next: number, word: string};

const run = async () => {
    const vocabulary = JSON.parse(await Deno.readTextFile(vocabularyPath)) as Record<string, string>;
    const otasks = JSON.parse(await Deno.readTextFile(oldTaskPath)) as Array<OldTask>;
    console.log(`Task: ${otasks.length}`);
    const tasks: Array<ITask> = [];
    for (const o of otasks)
        if (vocabulary[o.word])
            tasks.push({type: 'R', word: o.word, last: Math.round(o.last / 1000), next: Math.round(o.next / 1000), level: o.level});
    console.log(`Valid Task: ${tasks.length}`);
    try {
        let result;
        await mongorun(async client => {
            const collection = client.db('task').collection(btoa('sovar.he@gmail.com').replaceAll('=', ''));
            result = await collection.insertMany(tasks as any);
        }) ;
        console.log(`Insert: ${result!.insertedCount}`);
    } catch (e) {
        console.error(e);
    }
};

if (import.meta.main) run();