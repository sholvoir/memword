// deno-lint-ignore-file no-explicit-any
import { MemState } from '../../../lib/mem-server.ts';
import { sendEmail } from "../../../lib/email.ts";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers<any, MemState> = {
    async POST(req, ctx) {
        return await sendEmail({
            from: ctx.state.user,
            to: 'sovar.he@gmail.com',
            subject: `Issue Report from ${atob(ctx.state.user)}`,
            content: await req.text()
        })
    }
};