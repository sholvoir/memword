import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts';

const username = Deno.env.get('GMAIL_USERNAME');
const password = Deno.env.get('GMAIL_PASSWORD');

export async function sendActiveEmail(email: string, token: string) {
    const client = new SmtpClient();
    await client.connectTLS({ hostname: "smtp.gmail.com", port: 465, username, password });
    await client.send({ from: `MEMWORD <${username}>`, to: `${email}`, subject: 'Active your MEMWORD account', content: '', html: `
<p>Dear user ${email}:</p>
<p>Thanks for your register for MEMWORD, please click the flow link to active your account:</p>
<p><a href="https://www.micinfotech.com/memword?token=${token}">https://www.micinfotech.com/memword?token=${token}</a></p>
<p>If you can not click this link you can copy it and paste to you address of your brower and press enter.</p>
<p>Note: You must active your account in 14 days, or the link will expire.</p>
<p>Best Wish</p>
<p>MEMWORD(${username})</p>`
    });
    await client.close();
}
