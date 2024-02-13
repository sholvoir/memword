import { type Cookie, setCookie, getCookies } from "$std/http/cookie.ts";
import { JWT } from "generic-ts/jwt.ts";

export const jwt = new JWT({ iss: 'sholvoir.com', sub: 'memword' });
await jwt.importKey(Deno.env.get('MEM_KEY'));

const maxAge = 180 * 24 * 60 * 60;
export const setAuth = async (req: Request, resp: Response, aud: string) => {
    const domain = new URL(req.url).hostname.split('.');
    while (domain.length > 2) domain.shift();
    const cookie: Cookie = {
        name: 'auth',
        value: await jwt.createToken(maxAge, { aud }),
        maxAge,
        domain: domain.join('.')
    };
    setCookie(resp.headers, cookie);
    return resp;
}

export const getAuth = (req: Request) => {
    const auth = new URL(req.url).searchParams.get('auth');
    if (auth) return decodeURIComponent(auth)
    return getCookies(req.headers).auth ||
        req.headers.get('Authorization')?.match(/Bearer (.*)/)?.at(1);
}