import { Handlers } from "$fresh/server.ts";
import { jsonResponse } from "@sholvoir/generic/http";

export const handler: Handlers = {
    GET() {
        return jsonResponse([]);
    },
};