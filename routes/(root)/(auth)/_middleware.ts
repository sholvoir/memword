import { FreshContext } from "$fresh/server.ts";
import { forbidden } from '@sholvoir/generic/http';
import { MemState } from "../../../lib/server.ts";

export async function handler(_req: Request, ctx: FreshContext<MemState>) {
    return ctx.state.user ? await ctx.next() : forbidden;
}