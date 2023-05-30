// deno-lint-ignore-file no-empty
import { MiddlewareHandlerContext } from '$fresh/server.ts';
import { verifyToken } from "../../lib/jwt.ts";

export async function handler(req: Request, ctx: MiddlewareHandlerContext) {
    const authorization = req.headers.get("Authorization");
    if (authorization) {
        const match = authorization.match(/Bearer (.*)/);
        if (match) {
            const token = match[1];
            if (token) try {
                const payload = await verifyToken(token);
                ctx.state.user = { id: payload.aud };
            } catch { }
        }
    }
    return await ctx.next();
}