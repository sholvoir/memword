import { bundle } from "@deno/emit";
const { code } = await bundle(new URL("./lib/worker.ts", import.meta.url).href, { importMap: './deno.json', minify: true });
await Deno.writeTextFile('./static/service-worker.js', code);