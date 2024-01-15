import { Handlers } from "$fresh/server.ts";
import { internalServerError, jsonHeader } from "../lib/mem-server.ts";

const vocabularyUrl = 'https://www.sholvoir.com/vocabulary/0.0.1/vocabulary.json';

export const handler: Handlers = {
    async GET() {
        const res = await fetch(vocabularyUrl);
        if (!res.ok) return internalServerError;
        const resp = new Response(res.body, { headers: jsonHeader });
        resp.headers.append('Cache-Control', `max-age=${7*24*60*60}`);
        return resp;
    }
}