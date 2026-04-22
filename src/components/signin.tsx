/** biome-ignore-all lint/suspicious/noExplicitAny: <No> */
import { STATUS_CODE } from "@sholvoir/generic/http";
import BButton from "@sholvoir/solid-components/button-base";
import Button from "@sholvoir/solid-components/button-ripple";
import SInput from "@sholvoir/solid-components/input-simple";
import { type Accessor, createSignal, type Setter } from "solid-js";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog.tsx";
import { useG } from "./g-provider.tsx";

let timer: any;

export default (props: { name: Accessor<string>; setName: Setter<string> }) => {
   const [code, setCode] = createSignal("");
   const [counter, setCounter] = createSignal(0);
   const [canSendOTP, setCanSendOTP] = createSignal(true);
   const { go, showTips } = useG()!;

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
         switch ((await mem.sendOneTimePasscode(props.name())).status) {
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
         switch (await mem.signin(props.name(), code())) {
            case STATUS_CODE.BadRequest:
               return showTips("请输入用户名和密码");
            case STATUS_CODE.NotFound:
               return showTips("未找到用户");
            case STATUS_CODE.Unauthorized:
               return showTips("错误的密码");
            case STATUS_CODE.OK:
               showTips("已登录");
               if (timer) clearInterval(timer);
               location.reload();
               break;
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
               binding={[props.name, props.setName]}
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
