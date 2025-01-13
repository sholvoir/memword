import { MongoClient, ServerApi, ServerApiVersion } from 'mongodb';

const uri = Deno.env.get('MONGO_URI')!;
const serverApi: ServerApi = { version: ServerApiVersion.v1, strict: true, deprecationErrors: true };

async function mongorun<T>(func: (client: MongoClient) => Promise<T>) {
    const client = new MongoClient(uri, { serverApi });
    await client.connect();
    const result = await func(client);
    await client.close();
    return result;
}

export default mongorun;