// deno-lint-ignore-file no-explicit-any
import { MemState } from '../../lib/mem-server.ts';
import { setAuth } from "../../lib/jwt.ts";
import Root from '../../islands/root.tsx';
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers<any, MemState> = {
    async GET(req, ctx) {
        const resp = await ctx.render();
        if (!ctx.state.user) return resp;
        return await setAuth(req, resp, ctx.state.user);
    }
}

export default () => <Root/>;