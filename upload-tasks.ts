// deno-lint-ignore-file
import { Mongo } from 'generic-ts/mongo.ts';
import { ITask } from "./lib/itask.ts";

const endpoint = Deno.env.get('MONGO_END_POINT')!;
const apiKey = Deno.env.get('MONGO_API_KEY')!;
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
    const mongo = new Mongo(endpoint, apiKey, { dataSource: 'Cluster0', database: 'task', collection: btoa('sovar.he@gmail.com').replaceAll('=', '')});
    const result = await mongo.insertMany(tasks as any);
    console.log(`Insert: ${result.length}`);
};

if (import.meta.main) run();