import { MemContext } from '../../../lib/mem-server.ts';
import { sendEmail } from "../../../lib/email.ts";

export const handler = async (req: Request, ctx: MemContext) => await sendEmail({
    from: ctx.state.user,
    to: 'sovar.he@gmail.com',
    subject: `Issue Report from ${ctx.state.user}`,
    content: await req.text()
});
