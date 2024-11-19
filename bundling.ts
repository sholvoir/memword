import * as esbuild from 'esbuild';
import { denoPlugins } from "esbuild-deno-loader";

await esbuild.build({
    plugins: denoPlugins(),
    entryPoints: ['./lib/worker.ts'],
    outfile: "./static/service-worker.js",
    bundle: true,
    format: 'esm',
    //minify: true
});

esbuild.stop();