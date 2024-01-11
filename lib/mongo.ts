// deno-lint-ignore-file no-explicit-any
import { MongoClient, ServerApi, ServerApiVersion } from 'mongodb';

const uri = Deno.env.get('MONGO_URI')!;
const serverApi: ServerApi = { version: ServerApiVersion.v1, strict: true, deprecationErrors: true };

type RunType = (client: MongoClient) => Promise<any>
async function mongorun (func: RunType) {
    const client = new MongoClient(uri, { serverApi } as any);
    await client.connect();
    await func(client);
    await client.close();
}

export default mongorun;