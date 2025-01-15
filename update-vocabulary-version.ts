// deno-lint-ignore-file no-explicit-any
const catalog = 'system';
const kvPath = Deno.env.get('DENO_KV_PATH');
const path = './deno.json';

const run = async () => {
    const json: any = JSON.parse(await Deno.readTextFile(path));
    const version = (json.vocabulary as string).split('.').map(s=>parseInt(s));
    version[2]++;
    json.vocabulary = version.join('.');
    console.log(`vocabulary version ${json.vocabulary}`);

    const kv = await Deno.openKv(kvPath);
    const res = await kv.set([catalog, 'vocabulary-version'], json.vocabulary);
    console.log(res);

    await Deno.writeTextFile(path, JSON.stringify(json, undefined, 4));
}

if (import.meta.main) await run();