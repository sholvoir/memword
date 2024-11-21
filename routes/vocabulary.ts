// deno-lint-ignore-file no-cond-assign
import { Handlers } from "$fresh/server.ts";
import { internalServerError, jsonResponse } from "@sholvoir/generic/http";
import { VOCABULARY_URL } from "../lib/common.ts";

export const handler: Handlers = {
    async GET() {
        try {
            const res = await fetch(VOCABULARY_URL);
            if (!res.ok) return internalServerError;
            const delimiter = /[,:] */;
            const vocabulary = [];
            for (let line of (await res.text()).split('\n')) if (line = line.trim()) {
                const [word] = line.split(delimiter).map(w => w.trim());
                vocabulary.push(word);
            }
            return jsonResponse(vocabulary);
        } catch { return internalServerError; }
    },
};