import * as esbuild from 'esbuild';
import { denoPlugins } from "esbuild-deno-loader";

const run = async () => {
    await esbuild.build({
        plugins: denoPlugins(),
        entryPoints: ['./lib/worker.ts'],
        outfile: "./static/service-worker.js",
        bundle: true,
        format: 'esm',
        //minify: true
    });
    esbuild.stop();
};

if (import.meta.main) run();