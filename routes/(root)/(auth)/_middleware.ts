import { MemContext, forbidden } from "../../../lib/mem-server.ts";

export function handler(_req: Request, ctx: MemContext) {
    if (!ctx.state.user) return forbidden;
    ctx.state.collection = btoa(ctx.state.user).replaceAll('=', '');
    return ctx.next();
}