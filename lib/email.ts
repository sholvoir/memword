const MAIL_URL = 'https://mail-hw3lihpmoq-uc.a.run.app';
const headers = new Headers([
    ['Content-Type', 'application/json'],
    ['Authorization', `Bearer ${Deno.env.get('MAIL_TOKEN')}`]
]);

export async function sendActiveEmail(origin: string, email: string, token: string) {
    token = encodeURIComponent(token);
    const body = {
        from: `MEMWORD <memword.sholvoir@gmail.com>`,
        to: `${email}`,
        subject: 'Active your MEMWORD account',
        content: `<p>Dear user ${email}:</p>
<p>Thanks for your register for MEMWORD, please click the flow link to active your account:</p>
<p><a href="${origin}/active-email?auth=${token}">${origin}/active-email?auth=${token}</a></p>
<p>If you can not click this link you can copy it and paste to you address of your brower and press enter.</p>
<p>Note: You must active your account in 14 days, or the link will expire.</p>
<p>Best Wish</p>
<p>MEMWORD <memword.sholvoir@gmail.com></p>`
    };
    const response = await fetch(MAIL_URL, { headers, method: 'POST', body: JSON.stringify(body) });
    return response;
}
