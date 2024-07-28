// deno-lint-ignore-file no-explicit-any
import { MemState } from '../../../lib/server.ts';
import { sendEmail } from "../../../lib/email.ts";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers<any, MemState> = {
    async POST(req, ctx) {
        const email = atob(ctx.state.user);
        console.log(`API '/issue' POST ${ctx.state.user}`);
        return await sendEmail({
            from: email,
            to: 'sovar.he@gmail.com',
            subject: `Issue Report from ${email}`,
            content: await req.text()
        })
    }
};