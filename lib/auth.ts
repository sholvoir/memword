// const fetch = require('node-fetch');
// const GooleOAuth2Client = require('google-auth-library').OAuth2Client;
// const GOOGLE_CLIENT_ID = '1073249298428-3mjsm512f3jcpg98fop3tobiiov2rapn.apps.googleusercontent.com';
// const googleClient = new GooleOAuth2Client(GOOGLE_CLIENT_ID);
// const facebookAppID = '769214023446570';
// const facebookAppSecret = '268cda3aaef5b2abd70b4610a3886882';
// const verify = async (provider, token) => {
//     switch (provider) {
//         case 'facebook':
//             const res = await fetch(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${facebookAppID}|${facebookAppSecret}`);
//             const json = await res.json();
//             return `F-${json.data.user_id}`;
//         case 'google':
//             const ticket = await googleClient.verifyToken({ idToken: token, audience: GOOGLE_CLIENT_ID })
//             return `G-${ticket.getPayload().sub}`;
//         default:
//             return null;
//     }
// };
import { log } from 'https://sholvoir.github.io/generic/log.ts';
import { Context, helpers, Status, Request, Response } from 'https://deno.land/x/oak/mod.ts';
import { create, verify, Header } from "https://deno.land/x/djwt/mod.ts";
import { sendActiveEmail } from './email.ts';
const adminUserID = 'sovar.he@gmail.com';
const secret = Deno.env.get('AUTH_SECRET') || 'no_secret';

const expire = () => Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60;
const tokenHeader: Header = { alg: 'HS512' };
const tokenTemplate = { iss: 'micinfotech.com', sub: 'memword' };

async function createToken(userID: string) {
    const payload = {...tokenTemplate, aud: userID, exp: expire()};
    return await create(tokenHeader, payload, secret);
}
async function verifyToken(req: Request) {
    const authorization = req.headers.get('Authorization');
    if (!authorization) return null;
    const [authType, token] = authorization.split(' ');
    if (authType != 'Bearer') return null;
    if (!token) return null;
    try { return verify(token, secret, 'HS512'); }
    catch { return null; }
}

function unauth(res: Response) {
    res.status = Status.Forbidden;
}

export async function cors(ctx: Context, next: () => Promise<unknown>) {
    ctx.response.headers.set('Access-Control-Allow-Origin', '*');
    await next();
}

export async function options(ctx: Context) {
    ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
    ctx.response.status = Status.NoContent;
}

export async function signup(ctx: Context) {
    const email = helpers.getQuery(ctx).email;
    log('info', `${email} try Login!`);
    if (email) {
        await sendActiveEmail(email, await createToken(email));
        ctx.response.status = Status.NoContent;
    } else ctx.response.status = Status.BadRequest;
}

export async function renew(ctx: Context) {
    ctx.response.body = JSON.stringify({token: await createToken(ctx.state.user.id)});
}

export async function user(ctx: Context, next: () => Promise<unknown>) {
    const payload = await verifyToken(ctx.request);
    if (payload) {
        ctx.state.user = { id: payload.aud };
        await next();
        delete ctx.state.user;
    } else unauth(ctx.response);
};

export async function admin(ctx: Context, next: () => Promise<unknown>) {
    if (ctx.state.user.id == adminUserID) await next();
    else unauth(ctx.response);
};
