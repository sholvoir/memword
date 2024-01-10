import { FreshContext } from "$fresh/server.ts";
import { STATUS_CODE } from "$std/http/status.ts";

export const jsonHeader = new Headers([['Content-Type', 'application/json']]);
export type MemState = { user: string; collection: string }

export type MemContext = FreshContext<MemState>;
export const forbidden = new Response(undefined, { status: STATUS_CODE.Forbidden });
export const internalServerError = new Response(undefined, { status: STATUS_CODE.InternalServerError });