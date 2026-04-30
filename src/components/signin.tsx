import { STATUS_CODE } from "@sholvoir/generic/http";
import BButton from "@sholvoir/solid-components/button-base";
import Button from "@sholvoir/solid-components/button-ripple";
import SInput from "@sholvoir/solid-components/input-simple";
import { createSignal } from "solid-js";
import type { IUser } from "../lib/iuser.ts";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog.tsx";
import { go, setUser, showTips } from "./provider-g.ts";
import { name, setName } from "./provider-sign.ts";
import { afterLogin } from "./provider-user.ts";

let timer: NodeJS.Timeout | undefined;

export default () => {
   const [code, setCode] = createSignal("");
   const [counter, setCounter] = createSignal(0);
   const [canSendOTP, setCanSendOTP] = createSignal(true);

   const handleSend = async () => {
      setCanSendOTP(false);
      setCounter(60);
      timer = setInterval(() => {
         if (setCounter((c) => c - 1) <= 0) {
            clearInterval(timer);
            timer = undefined;
            setCanSendOTP(true);
         }
      }, 1000);
      try {
         switch ((await mem.sendOneTimePasscode(name())).status) {
            case STATUS_CODE.BadRequest:
               return showTips("请输入用户名");
            case STATUS_CODE.NotFound:
               return showTips("未找到用户");
            case STATUS_CODE.FailedDependency:
               return showTips("此用户未注册手机号码");
            case STATUS_CODE.TooEarly:
               return showTips("请求OTP过于频繁");
            case STATUS_CODE.OK:
               return showTips("OTP已发送");
            default:
               showTips("未知服务器错误");
         }
      } catch {
         showTips("网络错误");
      }
   };

   const handleClickLogin = async () => {
      try {
         const res = await mem.signin(name(), code());
         switch (res.status) {
            case STATUS_CODE.BadRequest:
               return showTips("请输入用户名和密码");
            case STATUS_CODE.NotFound:
               return showTips("未找到用户");
            case STATUS_CODE.Unauthorized:
               return showTips("错误的密码");
            case STATUS_CODE.OK: {
               showTips("已登录");
               const user: IUser = await res.json();
               if (timer) clearInterval(timer);
               mem.setUser(setUser(user));
               go("#home");
               afterLogin();
               break;
            }
            default:
               showTips("未知服务器错误");
         }
      } catch {
         showTips("网络错误");
      }
   };
   return (
      <Dialog class="p-2 flex flex-col" title="登录">
         <div class="w-64 m-auto flex flex-col">
            <label for="name">用户名</label>
            <SInput
               name="name"
               placeholder="name"
               autoCapitalize="none"
               binding={[name, setName]}
            />
            <div class="text-right mb-3">
               尚未
               <BButton
                  class="btn-anchor font-bold"
                  onClick={() => go("#signup")}
               >
                  注册
               </BButton>
               ?
            </div>
            <label for="code">临时密码</label>
            <SInput
               name="code"
               placeholder="code"
               autoCapitalize="none"
               binding={[code, setCode]}
            />
            <BButton
               class="btn-anchor block text-right mb-3"
               onClick={handleSend}
               disabled={!canSendOTP()}
            >
               Send One-Time Passcode {counter() > 0 ? `(${counter()})` : ""}
            </BButton>
            <Button class="button btn-prime" onClick={handleClickLogin}>
               登录
            </Button>
         </div>
      </Dialog>
   );
};
