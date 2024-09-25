import { type Cookie, setCookie, getCookies, deleteCookie } from "@std/http";
import { JWT } from "@sholvoir/generic/jwt";

export const jwt = new JWT({ iss: 'micit.co', sub: 'memword' });
await jwt.importKey(Deno.env.get('APP_KEY'));

const maxAge = 180 * 24 * 60 * 60;
export const setAuth = async (resp: Response, aud?: string) => {
    if (aud) {
        const cookie: Cookie = { name: 'auth', value: await jwt.createToken(maxAge, { aud }), maxAge };
        setCookie(resp.headers, cookie);
        resp.headers.append("Cache-Control", "private, max-age=31536000");
    }
    else deleteCookie(resp.headers, 'auth');
    return resp;
}

export const getAuth = (req: Request) => {
    const auth = new URL(req.url).searchParams.get('auth');
    if (auth) return decodeURIComponent(auth)
    return getCookies(req.headers).auth ||
        req.headers.get('Authorization')?.match(/Bearer (.*)/)?.at(1);
}