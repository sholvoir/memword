// deno-lint-ignore-file no-explicit-any
import { Handlers } from "$fresh/server.ts";
import { getDict } from '../../../lib/mw.ts';
import { dict } from '../../../lib/dict.ts';

const resInit = { headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
}};
const optionsInit = { headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS"
}};
const dictAdminId = Deno.env.get('DICT_ADMIN_ID') || 'aaa';

export const handler: Handlers = {
    OPTIONS(_) {
        return new Response(undefined, optionsInit);
    },
    async GET(_req, ctx) {
        const word = decodeURIComponent(decodeURIComponent(ctx.params.word).trim());
        if (word) {
            const value = await getDict(word);
            if (value) {
                new Response(JSON.stringify(value), resInit);
            }
        }
        return new Response('Not Found!', { status: 404 });
    },
    async POST(req, ctx) {
        if (!ctx.state.user || (<any>ctx.state.user).id != dictAdminId) {
            return new Response(undefined, { status: 401 });
        }
        const value = await req.json();
        if (value._id) delete value._id;
        value.word = decodeURIComponent(ctx.params.word).trim();
        const id = await dict.add(value);
        return new Response(id, { status: 200 });
    },
    async PATCH(req, ctx) {
        if (!ctx.state.user || (<any>ctx.state.user).id != dictAdminId) {
            return new Response(undefined, { status: 401 });
        }
        const word = decodeURIComponent(ctx.params.word).trim();
        const value = await req.json();
        if (value._id) delete value._id;
        if (value.word) delete value.word;
        const num = await dict.patch(word, value);
        return new Response(num.toString(), {status: 200});
    }
};
