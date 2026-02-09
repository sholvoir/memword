import { DOMParser } from "@b-fuze/deno-dom";
import type { Hono } from "hono";
import auth from "../mid/auth.ts";
import cookie from "../mid/cookie.ts";

const apply = (app: Hono) => {
   app.use("/", auth, cookie, async (c) => {
      const username = c.get("username");
      const text = await Deno.readTextFile("./public/index.html");
      const doc = new DOMParser().parseFromString(text, "text/html")!;
      const meta = doc.createElement("meta");
      meta.setAttribute("name", "username");
      meta.setAttribute("content", username);
      doc.querySelector("head")?.appendChild(meta);
      return c.html(doc.documentElement?.outerHTML ?? "");
   });
};

export default apply;
