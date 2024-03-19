import { IMail } from 'deno-esmtp/imail.ts';

const MAIL_URL = 'https://mail-mqjw43lfna-uc.a.run.app';

const headers = new Headers([
    ['Content-Type', 'application/json'],
    ['Authorization', `Bearer ${Deno.env.get('MAIL_TOKEN')}`]
]);

export const sendEmail = async (mail: IMail) => {
    return await fetch(MAIL_URL, { headers, method: 'POST', body: JSON.stringify(mail) });
}