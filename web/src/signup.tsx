import { STATUS_CODE } from "@sholvoir/generic/http";
import BButton from "@sholvoir/solid-components/button-base";
import RButton from "@sholvoir/solid-components/button-ripple";
import SInput from "@sholvoir/solid-components/input-simple";
import { createSignal } from "solid-js";
import * as srv from "../lib/server.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";

const namePattern = /^[_\w-]+$/;
const fonePattern = /^\+\d+$/;

export default () => {
   const [phone, setPhone] = createSignal("");
   const handleSignin = () => {
      app.go("#signin");
   };
   const handleSignup = async () => {
      if (!namePattern.test(app.name()))
         return app.showTips("Name can only include _, letter, number and -");
      const fone = phone().replaceAll(/[() -]/g, "");
      if (!fonePattern.test(fone)) return app.showTips("Invalid phone number!");
      try {
         switch ((await srv.signup(fone, app.name())).status) {
            case STATUS_CODE.BadRequest:
               return app.showTips("用户名已注册");
            case STATUS_CODE.Conflict:
               return app.showTips("电话号码已注册");
            case STATUS_CODE.OK:
               app.showTips("注册成功，请登录");
               return app.go("#signin");
            default:
               app.showTips("未知数服务器错误");
         }
      } catch {
         app.showTips("网络错误");
      }
   };
   return (
      <Dialog
         class="p-2 flex flex-col"
         title="注册"
         left={
            <BButton
               class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
               onClick={() => app.go("#about")}
            />
         }
      >
         <div class="w-64 m-auto flex flex-col pb-4">
            <label for="name">用户名</label>
            <SInput
               name="name"
               placeholder="name"
               autoCapitalize="none"
               binding={[app.name, app.setName]}
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
