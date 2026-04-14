import { STATUS_CODE } from "@sholvoir/generic/http";
import BButton from "@sholvoir/solid-components/button-base";
import RButton from "@sholvoir/solid-components/button-ripple";
import SInput from "@sholvoir/solid-components/input-simple";
import { type Accessor, createSignal, type Setter } from "solid-js";
import type { TDial } from "../lib/idial.ts";
import * as srv from "../lib/server.ts";
import Dialog from "./dialog.tsx";

const namePattern = /^[_\w-]+$/;
const fonePattern = /^\+\d+$/;

export default (props: {
   go: (d?: TDial) => void;
   name: Accessor<string>;
   setName: Setter<string>;
   showTips: (content: string, autohide?: boolean) => void;
   tips: Accessor<string>;
}) => {
   const [phone, setPhone] = createSignal("");
   const handleSignin = () => {
      props.go("#signin");
   };
   const handleSignup = async () => {
      if (!namePattern.test(props.name()))
         return props.showTips("Name can only include _, letter, number and -");
      const fone = phone().replaceAll(/[() -]/g, "");
      if (!fonePattern.test(fone))
         return props.showTips("Invalid phone number!");
      try {
         switch ((await srv.signup(fone, props.name())).status) {
            case STATUS_CODE.BadRequest:
               return props.showTips("用户名已注册");
            case STATUS_CODE.Conflict:
               return props.showTips("电话号码已注册");
            case STATUS_CODE.OK:
               props.showTips("注册成功，请登录");
               return props.go("#signin");
            default:
               props.showTips("未知数服务器错误");
         }
      } catch {
         props.showTips("网络错误");
      }
   };
   return (
      <Dialog
         tips={props.tips}
         class="p-2 flex flex-col"
         title="注册"
         leftClick={() => props.go("#about")}
      >
         <div class="w-64 m-auto flex flex-col pb-4">
            <label for="name">用户名</label>
            <SInput
               name="name"
               placeholder="name"
               autoCapitalize="none"
               binding={[props.name, props.setName]}
               class="mb-3"
            />
            <label for="phone">手机号码(含国际区号)</label>
            <SInput
               name="phone"
               placeholder="+1(987)765-5432"
               autoCapitalize="none"
               binding={[phone, setPhone]}
               class="mb-3"
            />
            <div class="text-right mb-3">
               已经注册，请
               <BButton class="btn-anchor font-bold" onClick={handleSignin}>
                  登录
               </BButton>
            </div>
            <RButton class="button btn-prime py-1" onClick={handleSignup}>
               注册
            </RButton>
         </div>
      </Dialog>
   );
};
