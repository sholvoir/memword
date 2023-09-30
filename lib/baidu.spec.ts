import { trans } from './baidu.ts';

for (const en of Deno.args) console.log(await trans(en));