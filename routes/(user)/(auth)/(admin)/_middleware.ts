import { FreshContext } from "$fresh/server.ts";
import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";

export async function handler(_req: Request, ctx: FreshContext) {
    return ctx.state.user == 'sovar.he@gmail.com' ?
        await ctx.next() : emptyResponse(STATUS_CODE.Forbidden);
}