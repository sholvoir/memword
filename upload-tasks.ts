// deno-lint-ignore-file
import { Mongo } from 'generic-ts/mongo.ts';

const endpoint = Deno.env.get('MONGO_END_POINT')!;
const apiKey = Deno.env.get('MONGO_API_KEY')!;

interface Task {
    type: string;
    word: string,
    last: number;
    next: number;
    level: number;
}

const run = async () => {
    const vocabulary = JSON.parse(await Deno.readTextFile('../sholvoir.github.io/vocabulary/0.0.1/vocabulary.json')) as Record<string, string>;
    const otasks = JSON.parse(await Deno.readTextFile('./data/memword.json')) as Array<{level: number, hard: number, last: number, next: number, word: string}>;
    console.log(`Task: ${otasks.length}`);
    const tasks: Array<Task> = [];
    for (const o of otasks) if (vocabulary[o.word]) tasks.push({type: 'R', word: o.word, last: o.last, next: o.next, level: o.level});
    console.log(`Valid Task: ${tasks.length}`);
    const mongo = new Mongo(endpoint, apiKey, { dataSource: 'Cluster0', database: 'task', collection: btoa('sovar.he@gmail.com').replaceAll('=', '')});
    const result = await mongo.insertMany(tasks as any);
    console.log(`Insert: ${result.length}`);
};

if (import.meta.main) run();