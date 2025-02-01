import { FreshContext } from "$fresh/server.ts";
import { emptyResponse, STATUS_CODE } from '@sholvoir/generic/http';
import { MemState } from "../../../lib/fresh.ts";

export async function handler(_req: Request, ctx: FreshContext<MemState>) {
    return ctx.state.user ? await ctx.next() : emptyResponse(STATUS_CODE.Forbidden);
}