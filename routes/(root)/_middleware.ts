import { FreshContext } from "$fresh/server.ts";
import { MemState} from "../../lib/mem-server.ts";
import { jwt, getAuth } from "../../lib/jwt.ts";

export async function handler(req: Request, ctx: FreshContext<MemState>) {
    const token = getAuth(req);
    const payload = token && await jwt.verifyToken(token);
    if (payload) ctx.state.user = payload.aud as string;
    return await ctx.next();
}