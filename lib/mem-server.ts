import { STATUS_CODE } from "$std/http/status.ts";

export const jsonHeader = new Headers([['Content-Type', 'application/json']]);
export type MemState = { user: string };

export const ok = new Response();
export const notFound = new Response(undefined, { status: STATUS_CODE.NotFound });
export const forbidden = new Response(undefined, { status: STATUS_CODE.Forbidden });
export const badRequest = new Response(undefined, { status: STATUS_CODE.BadRequest });
export const internalServerError = new Response(undefined, { status: STATUS_CODE.InternalServerError });