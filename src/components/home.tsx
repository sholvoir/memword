import Button from "@sholvoir/solid-components/button-ripple";
import { For } from "solid-js";
import { splitID } from "../lib/ibook.ts";
import { aggrToBAggr, type IStat } from "../lib/istat.ts";
import Dialog from "./dialog.tsx";
import { go } from "./provider-g.ts";
import { goStudy } from "./provider-study.ts";
import { stats } from "./provider-user.ts";
import Stat from "./stat.tsx";

const sum = (s: number, b: number) => s + b;
const max = (a: number, b: number) => (a > b ? a : b);
const statInfo = (stat: IStat) => {
   const totals = aggrToBAggr(stat.total);
   const tasks = aggrToBAggr(stat.task);
   const width = totals.reduce(max) * 1.2;
   const totalSum = stat.total.reduce(sum);
   const taskSum = stat.task.reduce(sum);
   const wlname = stat.bid ? splitID(stat.bid)[1] : "";
   const title = `${stat.disc ?? wlname} - ${taskSum}|${totalSum}`;
   return { bid: stat.bid!, totals, tasks, width, title };
};

export default () => (
   <Dialog
      class="overflow-y-auto"
      title="学习进度"
      noleft={true}
      bottom={
         <div
            class="tail shrink-0 px-4 pt-2 pb-5 flex gap-2 justify-between [&>button]:grow
		            [&>button>span]:align-[-30%] [&>button]:min-w-21 [&>button>span]:text-4xl
		            font-bold overflow-x-auto scrollbar-none"
         >
            <Button onClick={() => go("#trans")}>
               <span class="icon--hugeicons icon--hugeicons--translate"></span>{" "}
               翻译
            </Button>
            <Button onClick={() => goStudy()}>
               <span class="icon--hugeicons icon--hugeicons--online-learning-01"></span>{" "}
               单词
            </Button>
            <Button onClick={() => go("#sentence")}>
               <span class="icon--hugeicons icon--hugeicons--online-learning-02"></span>{" "}
               句子
            </Button>
            <Button onClick={() => go("#setting")}>
               <span class="icon--material-symbols icon--material-symbols--settings"></span>{" "}
               设置
            </Button>
            <Button onClick={() => go("#about")}>
               <span class="icon--tabler icon--tabler--info-octagon"></span>{" "}
               关于
            </Button>
            <Button onClick={() => go("#issue")}>
               <span class="icon--material-symbols icon--material-symbols--error"></span>{" "}
               问题
            </Button>
            <Button onClick={() => go("#help")}>
               <span class="icon--material-symbols icon--material-symbols--help-outline"></span>{" "}
               帮助
            </Button>
         </div>
      }
   >
      <div class="p-2 flex flex-wrap justify-between gap-4">
         <For each={stats().stats}>
            {(stat: IStat) => <Stat {...statInfo(stat)} />}
         </For>
      </div>
   </Dialog>
);
