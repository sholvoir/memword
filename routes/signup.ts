import { Handlers } from "$fresh/server.ts";
import { sendEmail } from "../lib/email.ts";
import { IUser } from "../lib/iuser.ts";
import { badRequest } from '../lib/mem-server.ts';
import mongorun from '../lib/mongo.ts';

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

export const handler: Handlers = {
    async GET(req) {
        const url = new URL(req.url);
        const rawEmail = url.searchParams.get('email');
        if (!rawEmail) return badRequest;
        const email = decodeURIComponent(rawEmail).toLowerCase();
        if (!emailPattern.test(email)) return badRequest;
        const name = btoa(email).replaceAll('=', '');
        const pass = Math.random().toString(36).slice(7);
        const user: IUser = { name, pass, expire: Math.round(Date.now() / 1000) + 5 * 60 }
        await mongorun(async (client) => {
            await client.db('user').collection('user').updateOne({ name }, { $set: user }, { upsert: true });
        });
        const mail = {
            from: 'MEMWORD <memword.sholvoir@gmail.com>',
            to: `${email}`,
            subject: 'Your MemWord Account',
            content: `<p>Dear user ${email}:</p>
                <p>Thanks for your using MEMWORD, the flow is your temporary password:</p>
                <p style="padding: 8px; font-size: 40px; font-weight: 700">${pass}</p>
                <p>Note: You must use this temporary password in 5 minutes, or the it will expire.</p>
                <p>Best Wish</p>
                <p>MEMWORD <memword.sholvoir@gmail.com></p>
            `
        };
        return await sendEmail(mail);
    }
};
