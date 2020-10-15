const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    secureConnection: false,
    port: 587,
    tls: { ciphers: 'SSLv3' },
    auth: {
        user: 'sovar.he@hotmail.com',
        pass: '4q7NpkwaLamanM4'
    }
});

exports.sendActiveEmail = (email, token) => transporter.sendMail({
    from: '"MEMWORD"<sovar.he@hotmail.com>',
    to: email,
    subject: 'Active your MEMWORD account',
    html: `<p>Dear user ${email}:</p>
    <p>Thanks for your register for MEMWORD, please click the flow link to active your account:</p>
    <p><a href="https://www.micinfotech.com/memword?token=${token}">https://www.micinfotech.com/memword?token=${token}</a></p>
    <p>If you can not click this link you can copy it and paste to you address of your brower and press enter.</p>
    <p>Note: You must active your account in 14 days, or the link will expire.</p>
    <p>Best Wish</p>
    <p>MEMWORD</p>
    <p>sovar.he@hotmail.com</p>`
});