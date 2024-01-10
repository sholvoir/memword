import { MemContext } from "../../lib/mem-server.ts";
import { jwt, getAuth } from "../../lib/jwt.ts";

export async function handler(req: Request, ctx: MemContext) {
    const token = getAuth(req);
    const payload = token && await jwt.verifyToken(token);
    if (payload) ctx.state.user = payload.aud as string ;
    return await ctx.next();
}