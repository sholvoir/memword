// deno-lint-ignore-file no-empty no-explicit-any
import { getCookies } from "$std/http/cookie.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { verifyToken } from "/lib/jwt.ts";

export async function handler(req: Request, ctx: MiddlewareHandlerContext) {
    const token = getCookies(req.headers).Authorization || req.headers.get("Authorization")?.match(/Bearer (.*)/)?.at(1);
    if (token) try { ctx.state.user = { id: (await verifyToken(token)).aud }; } catch {}
    if (!(<any>ctx.state.user)?.id && new URL(req.url).pathname != '/about') return Response.redirect('/about');
    return await ctx.next();
}