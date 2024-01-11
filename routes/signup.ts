import { FreshContext } from "$fresh/server.ts";
import { sendEmail } from "../lib/email.ts";
import { STATUS_CODE } from "$std/http/status.ts";
import { jwt } from "../lib/jwt.ts";

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

export const handler = async (req: Request, _ctx: FreshContext) => {
    const url = new URL(req.url);
    const email = decodeURIComponent(url.searchParams.get('email')!).toLowerCase();
    if (!email || !emailPattern.test(email))
        return new Response(undefined, { status: STATUS_CODE.BadRequest });
    const token = encodeURIComponent(await jwt.createToken(10 * 60, { aud: email }));
    const mail = {
        from: 'MEMWORD <memword.sholvoir@gmail.com>',
        to: `${email}`,
        subject: 'Active your MEMWORD account',
        content: `<p>Dear user ${email}:</p>
<p>Thanks for your register for MEMWORD, please click the flow link to active your account:</p>
<p><a href="${url.origin}/active-email?auth=${token}">${url.origin}/active-email?auth=${token}</a></p>
<p>If you can not click this link you can copy it and paste to you address of your brower and press enter.</p>
<p>Note: You must active your account in 14 days, or the link will expire.</p>
<p>Best Wish</p>
<p>MEMWORD <memword.sholvoir@gmail.com></p>`
    };
    return await sendEmail(mail);
};
