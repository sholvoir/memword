import { MemContext, jsonHeader } from "../../../../lib/mem-server.ts";
import { Mongo } from 'generic-ts/mongo.ts';

const endpoint = Deno.env.get('MONGO_END_POINT')!;
const apiKey = Deno.env.get('MONGO_API_KEY')!;

export const handler = async (req: Request, ctx: MemContext) => {
  const lastgt = +new URL(req.url).searchParams.get('lastgt')!;
  const mongo = new Mongo(endpoint, apiKey, { dataSource: 'Cluster0', database: 'task', collection: ctx.state.collection});
  const result = await mongo.find({ last: { $gt: lastgt }});
  const ntasks = await req.json();
  await mongo.act('task_merge', { documents: ntasks });
  return new Response(JSON.stringify(result), { headers: jsonHeader });
};
