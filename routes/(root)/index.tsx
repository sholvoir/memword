import { PageProps } from "$fresh/server.ts";
import { MemContext } from '../../lib/mem-server.ts';
import { setAuth } from "../../lib/jwt.ts";
import Root from '../../islands/root.tsx';

export const handler = async (_req: Request, ctx: MemContext) => {
    if (!ctx.state.user) return await ctx.render()
    return await setAuth(await ctx.render(), ctx.state.user);
}

export default (_props: PageProps) => <Root/>;