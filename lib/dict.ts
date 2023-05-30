import { Mongo } from 'sholvoir/mongo.ts';
import { IDict } from './idict.ts';

const mongo = new Mongo(
    Deno.env.get('MONGO_DB_END_POINT')!,
    Deno.env.get('MONGO_DB_API_KEY')!,
    {
        "dataSource": "Cluster0",
        "database": "dict",
        "collection": "dict"
    });

export const dict = {
    async get(word: string) {
        return (await mongo.findOne({ word })) as IDict;
    },
    async remove(word: string) {
        return await mongo.deleteOne({ word });
    },
    async add(dict: IDict) {
        return await mongo.insertOne(dict as Record<string, unknown>);
    },
    async patch(word: string, value: IDict) {
        if (value.word) delete value.word;
        if (value._id) delete value._id;
        return await mongo.updateOne({ word }, value as Record<string, unknown>);
    }
}