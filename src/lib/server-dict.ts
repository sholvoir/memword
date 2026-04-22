import { getJson, url } from "@sholvoir/generic/http";
import type { IDict } from "./idict.ts";

const API_BASE =
   window.location.hostname === "localhost"
      ? "http://localhost:8080/api/v2"
      : "https://dict.micinfotech.com/api/v2";

export const dict_get = (word: string) =>
   getJson<IDict>(url(`${API_BASE}/dict`, { q: word, mic: "1" }));

export const sound_get = (surl: string) =>
   fetch(url(`${API_BASE}/sound`, { q: surl }), { cache: "force-cache" });

export const vocabulary_get = () =>
   getJson<{ words: Array<string>; checksum: string }>(
      `${API_BASE}/vocabulary`,
   );

export const vocabulary_checksum_get = () =>
   getJson<{ checksum: string }>(`${API_BASE}/vocabulary/checksum`);
