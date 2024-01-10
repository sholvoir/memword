import { FreshContext } from "$fresh/server.ts";
import { sendActiveEmail } from "../lib/email.ts";
import { STATUS_CODE } from "$std/http/status.ts";
import { jwt } from "../lib/jwt.ts";

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

export const handler = async (req: Request, _ctx: FreshContext) => {
    const url = new URL(req.url);
    const email = decodeURIComponent(url.searchParams.get('email')!).toLowerCase();
    if (!email || !emailPattern.test(email))
        return new Response(undefined, { status: STATUS_CODE.BadRequest });
    const token = await jwt.createToken(10 * 60, { aud: email });
    return await sendActiveEmail(url.origin, email, token);
};
