const GooleOAuth2Client = require('google-auth-library').OAuth2Client;
const jwt = require('jsonwebtoken');
const GOOGLE_CLIENT_ID = '1073249298428-3mjsm512f3jcpg98fop3tobiiov2rapn.apps.googleusercontent.com';
const googleClient = new GooleOAuth2Client(GOOGLE_CLIENT_ID);
const adminUserID = '';

const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const expire = () => Math.floor(Date.now() / 1000) + 10800;

const googleVerify = async (token) => {
    const ticket = await googleClient.verifyIdToken({idToken: token, audience: GOOGLE_CLIENT_ID})
    return `G-${ticket.getPayload().sub}`;
}

const unauth = (res) => res.status(402).end();
const getToken = (req, tokenType) => {
    const authorization = req.get('Authorization');
    if (!authorization) return null;
    const [authType, token] = authorization.split(' ');
    if (!authType || !token || authType != tokenType) return null;
    return token;
}

exports.login = (req, res) => {
    const token = getToken(req, 'OAuth')
    if (!token) { unauth(res); return; }
    const userid = await googleVerify(token);
    let payload = { userid, exp: expire() }
    res.setHeader('Authorization', 'Bearer ' + jwt.sign(payload, secret));
    res.status(200).end();
};

exports.renew = (req, res) => {
    let payload = { userid: res.locals.user.id, exp: expire() }
    res.setHeader('Authorization', 'Bearer ' + jwt.sign(payload, secret));
    res.status(200).end();
};

exports.user = (req, res, next) => {
    const token = getToken(req, 'Bearer')
    if (!token) { unauth(res); return; }
    jwt.verify(token, secret, (err, payload) => {
        if (err) { unauth(res); return }
        res.locals.user = { id: payload.userid };
        next();
    })
};

exports.admin = (req, res, next) => {
    if (res.locals.user.id != adminUserID) { unauth(res); return }
    next();
};