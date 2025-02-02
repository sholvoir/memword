// deno-lint-ignore-file no-explicit-any
import { Handlers } from "$fresh/server.ts";
import { MemState } from '../../lib/fresh.ts';
import { setAuth } from "../../lib/jwt.ts";
import Root from '../../islands/root.tsx';

export const handler: Handlers<any, MemState> = {
    async GET(_req, ctx) {
        return await setAuth(await ctx.render(), ctx.state.user);
    }
}

export default () => <Root/>;