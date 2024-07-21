// deno-lint-ignore-file no-explicit-any
import { MemState } from '../../lib/mem-server.ts';
import { setAuth } from "../../lib/jwt.ts";
import Root from '../../islands/root.tsx';
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers<any, MemState> = {
    async GET(_req, ctx) {
        return await setAuth(await ctx.render(), ctx.state.user);
    }
}

export default () => <Root/>;