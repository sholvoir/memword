import { Handlers } from "$fresh/server.ts";
import { emptyResponse, STATUS_CODE } from '@sholvoir/generic/http';

const defaultAgent = 'Thunder Client (https://www.thunderclient.com)';

export const handler: Handlers = {
    async GET(req) {
        try {
            const soundUrl = new URL(req.url).searchParams.get('q');
            if (!soundUrl) return emptyResponse(STATUS_CODE.BadRequest);
            const reqInit = { headers: { 'User-Agent': req.headers.get('User-Agent') ?? defaultAgent} }
            const resp = await fetch(soundUrl, reqInit);
            if (!resp.ok) return emptyResponse(STATUS_CODE.NotFound);
            const headers = new Headers();
            resp.headers.forEach((value, key) => headers.set(key, value));
            headers.set('Cache-Control', 'public, max-age=31536000');
            return new Response(resp.body, { headers });
        } catch (e) {
            console.error(e);
            return emptyResponse(STATUS_CODE.InternalServerError);
        }
    }
};
