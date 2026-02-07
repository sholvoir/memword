import { version } from "../package.json" with { type: "json" };
export { version };
export const API_URL =
   window.location.hostname === "localhost"
      ? "http://localhost:8000/api/v2"
      : "https://memword.micinfotech.com/api/v2";
export const COMMON_BOOK_BASE_URL = "https://www.micinfotech.com/vocabulary";
export const dictExpire = 7 * 24 * 60 * 60;
