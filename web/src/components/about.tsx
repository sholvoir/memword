import { createSignal, Show } from "solid-js";
import * as app from "./app.tsx";
import "./about.css";
import BButton from "@sholvoir/solid-components/button-base";
import RButton from "@sholvoir/solid-components/button-ripple";
import Input from "@sholvoir/solid-components/input-simple";
import { version } from "../lib/common.ts";
import * as idb from "../lib/indexdb.ts";
import Dialog from "./dialog.tsx";

export default () => {
   const [show, setShow] = createSignal(false);
   const [auth, setAuth] = createSignal("");
   return (
      <Dialog
         left={
            <Show when={app.user()}>
               <BButton
                  class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
                  onClick={() => app.go("#home")}
               />
            </Show>
         }
         title="快乐背单词"
         class="about flex flex-col pb-4 font-extrabold overflow-y-auto"
      >
         <Show when={show()}>
            <div>
               <Input binding={[auth, setAuth]} />
               <BButton
                  class="button bg-slate-300 text-slate-800"
                  onClick={async () => {
                     await idb.setMeta("_auth", auth());
                     location.replace(".");
                  }}
               >
                  Login
               </BButton>
            </div>
         </Show>
         <div>
            <h1>快乐背单词</h1>
            <p>版本：{version}</p>
            <BButton
               class="px-2 py-1 button bg-orange-300 text-slate-800"
               onClick={() => location.reload()}
            >
               重新加载
            </BButton>
         </div>
         <div>
            <h1>语言基础</h1>
            <p>
               词汇是<b>语言的基础</b>，学习语言应该掌握一定数量的基础词汇。
            </p>
         </div>
         <div>
            <h1>高频词汇</h1>
            <p>
               每个词汇的重要程度是不一样的，越是使用<b>频率高的词汇</b>
               ，其重要程度越高，本工具提供多种词频工具统计的结果词书。
            </p>
         </div>
         <div>
            <h1>遗忘曲线</h1>
            <p>
               记忆最大的敌人是遗忘，本工具依据「艾宾浩斯」<b>遗忘曲线</b>
               设计大脑刺激频率，以最大化记忆效率。
            </p>
         </div>
         <div>
            <h1>碎片时间</h1>
            <p>
               现代人工作学习都非常忙碌，充分利用好<b>碎片时间</b>
               ，是成功的关键。
            </p>
         </div>
         <Show when={!app.user()}>
            <div>
               <h1>开始学习</h1>
               <p>
                  使用你的手机，单击
                  <RButton
                     class="button bg-orange-300 text-slate-800"
                     title="login"
                     onClick={() => app.go("#signup")}
                  >
                     登录
                  </RButton>
                  开始免费学习吧。
               </p>
            </div>
         </Show>
         <div>
            <h1>微信</h1>
            <p>
               *提示一：请使用<b>除微信以外</b>
               的其他浏览器，如果当前是在微信中，点击屏幕右上(...)，然后选择「在默认浏览器中打开」。
            </p>
         </div>
         <div>
            <h1>安装</h1>
            <p class="mb-3">
               *提示二(iOS): 请使用「共享」-「添加到主屏幕」安装 <b>Web应用</b>{" "}
               到桌面，以便下次直接
               <BButton onClick={() => setShow(true)}>点击</BButton>进入。
            </p>
            <p>
               *提示三(Android): 请使用「...」-「安装应用」安装 <b>Web应用</b>{" "}
               到桌面，以便下次直接点击进入。
            </p>
         </div>
      </Dialog>
   );
};
