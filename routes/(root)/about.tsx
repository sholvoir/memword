// deno-lint-ignore-file no-explicit-any
import { defineRoute } from "$fresh/server.ts";
import Signup from '/islands/Signup.tsx';

export default defineRoute((req, ctx) => {
    const isLogin = (ctx.state as any).user?.id;
    return (<>
        {isLogin && <div class="text-right uppercase"><Signup/></div>}
        <Signup/>
    </>)
})