import { Handlers } from "$fresh/server.ts";
import { IDict } from "dict/lib/idict.ts";
import { jsonHeader } from "../../lib/mem-server.ts";

const dictApi = 'https://dict.sholvoir.com/api';
const blobToBase64 = (blob: Blob) => new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result as string);
});
const updateSound = async (dict: IDict) => {
    if (dict.sound?.startsWith('http')) {
        const resp = await fetch(dict.sound);
        if (resp.ok) dict.sound = await blobToBase64(await resp.blob());
    }
}

export const handler: Handlers = {
    async GET(_req, ctx) {
        const res = await fetch(`${dictApi}/${ctx.params.word}`);
        if (!res.ok) return res;
        const dict = await res.json() as IDict;
        updateSound(dict);
        const resp = new Response(JSON.stringify(dict), { headers: jsonHeader });
        resp.headers.append('Cache-Control', `max-age=${24*60*60}`);
        return resp;
    }
}