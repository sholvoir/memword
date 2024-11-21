import { Handlers } from "$fresh/server.ts";
import { badRequest, internalServerError } from '@sholvoir/generic/http';
import { sendEmail } from "../lib/email.ts";
import { IPass } from "../lib/ipass.ts";
import { now } from "../lib/common.ts";

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
const catalog = 'password';
const kvPath = Deno.env.get('DENO_KV_PATH');

export const handler: Handlers = {
    async GET(req) {
        try {
            const rawEmail = new URL(req.url).searchParams.get('email');
            if (!rawEmail) return badRequest;
            const email = decodeURIComponent(rawEmail).toLowerCase();
            if (!emailPattern.test(email)) return badRequest;
            const password = Math.random().toString(36).slice(7);
            const pass: IPass = { password, expire: now() + 5 * 60 };
            const kv = await Deno.openKv(kvPath);
            await kv.set([catalog, btoa(email).replaceAll('=', '')], pass);
            kv.close();
            const mail = {
                from: 'MEMWORD <memword.micit@gmail.com>',
                to: `${email}`,
                subject: 'Your MemWord Account',
                content: `<p>Dear user ${email}:</p>
                    <p>Thanks for your using MEMWORD, the flow is your temporary password:</p>
                    <p style="padding: 8px; font-size: 40px; font-weight: 700">${password}</p>
                    <p>Note: You must use this temporary password in 5 minutes, or the it will expire.</p>
                    <p>Best Wish</p>
                    <p>MEMWORD <memword.micit@gmail.com></p>
                `
            };
            console.log(`API '/signup' POST ${email}`);
            return await sendEmail(mail);
        } catch { return internalServerError; }
    }
};
