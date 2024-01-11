import { MemContext } from '../../lib/mem-server.ts';
import { setAuth } from "../../lib/jwt.ts";
import Root from '../../islands/root.tsx';

export const handler = async (_req: Request, ctx: MemContext) => {
    const resp = await ctx.render();
    if (!ctx.state.user) return resp;
    return await setAuth(resp, ctx.state.user);
}

export default () => <Root/>;