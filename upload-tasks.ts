import { MongoClient } from 'mongo';

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
    const mongo = new MongoClient({endpoint, auth: { apiKey }, dataSource: 'Cluster0'});
    const collection = mongo.database('task').collection<Task>(btoa('sovar.he@gmail.com').replaceAll('=', ''))
    const result = await collection.insertMany(tasks);
    console.log(`Insert: ${result.insertedIds.length}`);
};

if (import.meta.main) run();