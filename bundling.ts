import { bundle } from "@deno/emit";
const { code } = await bundle(new URL("./lib/worker.ts", import.meta.url).href);
await Deno.writeTextFile('./static/worker.js', code);