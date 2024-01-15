import { FreshContext } from "$fresh/server.ts";
import { MemState, forbidden } from "../../../lib/mem-server.ts";

export async function handler(_req: Request, ctx: FreshContext<MemState>) {
    return ctx.state.user ? await ctx.next() : forbidden;
}