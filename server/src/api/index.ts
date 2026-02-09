import type { Hono } from "hono";
import auth from "../mid/auth.ts";
import cookie from "../mid/cookie.ts";

const apply = (app: Hono) => {
   app.use("/", auth, cookie, async (c) => {
      const username = c.get("username");
      const text = await Deno.readTextFile("./public/index.html");
      return c.html(text.replace("{{username}}", username));
   });
};

export default apply;
