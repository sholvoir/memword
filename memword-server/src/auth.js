// const fetch = require('node-fetch');
// const GooleOAuth2Client = require('google-auth-library').OAuth2Client;
// const GOOGLE_CLIENT_ID = '1073249298428-3mjsm512f3jcpg98fop3tobiiov2rapn.apps.googleusercontent.com';
// const googleClient = new GooleOAuth2Client(GOOGLE_CLIENT_ID);
// const facebookAppID = '769214023446570';
// const facebookAppSecret = '268cda3aaef5b2abd70b4610a3886882';
const jwt = require('jsonwebtoken');
const sendActiveEmail = require('./email').sendActiveEmail;
const adminUserID = 'sholvoir.he@gmail.com';

//const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const secret = 'abcajasdogjreopfdklj;askgp[db;';

const now = () => Math.floor(Date.now() / 1000);
const expireTime = 14 * 24 * 60 * 60;
const expire = () => now() + expireTime;
const tokenTemplate = { iss: 'amay.club', sub: 'memword' };

// const verify = async (provider, token) => {
//     switch (provider) {
//         case 'facebook':
//             const res = await fetch(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${facebookAppID}|${facebookAppSecret}`);
//             const json = await res.json();
//             return `F-${json.data.user_id}`;
//         case 'google':
//             const ticket = await googleClient.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID })
//             return `G-${ticket.getPayload().sub}`;
//         default:
//             return null;
//     }
// };

const unauth = (res) => res.status(402).end();
const getToken = (req, tokenType) => {
    const authorization = req.get('Authorization');
    if (!authorization) return null;
    const [authType, token] = authorization.split(' ');
    if (!authType || !token || authType != tokenType) return null;
    return token;
};

const cors = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://sholvoir.github.io');
    next();
}

const optionsProcess = (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
}

const login = (req, res) => {
    const email = req.query.email;
    console.log(`${email} Login!`)
    let payload = Object.assign({ aud: email, exp: expire() }, tokenTemplate);
    sendActiveEmail(email, jwt.sign(payload, secret))
        .then(info => res.status(200).json(info));
};

const renew = (req, res) => {
    let payload = Object.assign({ aud: res.locals.user.id, exp: expire() }, tokenTemplate)
    res.status(200).json({ token: jwt.sign(payload, secret) });
};

const user = (req, res, next) => {
    const token = req.token || getToken(req, 'Bearer');
    if (!token) { unauth(res); return; }
    jwt.verify(token, secret, (err, payload) => {
        if (err) { unauth(res); return; }
        res.locals.user = { id: payload.aud };
        //res.setHeader('Access-Control-Allow-Credentials', 'true');
        next();
    })
};

const admin = (req, res, next) => {
    if (res.locals.user.id == adminUserID) next();
    else unauth(res);
};

module.exports = { cors, login, renew, user, admin, optionsProcess }