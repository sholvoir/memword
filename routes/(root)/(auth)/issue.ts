// deno-lint-ignore-file no-explicit-any
import { MemState } from '../../../lib/fresh.ts';
import { sendEmail } from "../../../lib/email.ts";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers<any, MemState> = {
    async POST(req, ctx) {
        const email = atob(ctx.state.user);
        console.log(`API '/issue' POST ${ctx.state.user}`);
        const issue = (await req.json()).issue;
        return await sendEmail({
            from: 'MEMWORD <memword.sholvoir@gmail.com>',
            to: 'sovar.he@gmail.com',
            subject: `Issue Report from ${email}`,
            content: issue
        })
    }
};