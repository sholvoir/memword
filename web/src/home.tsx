import { splitID } from "@sholvoir/memword-common/ibook";
import Button from "@sholvoir/solid-components/button-ripple";
import { For } from "solid-js";
import { aggrToBAggr, type IStat } from "../lib/istat.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";
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
   <Dialog class="flex flex-col" title="学习进度">
      <div class="body grow overflow-y-auto">
         <div class="p-2 flex flex-wrap justify-between gap-4">
            <For each={app.stats().stats}>
               {(stat: IStat) => <Stat {...statInfo(stat)} />}
            </For>
         </div>
      </div>
      <div
         class="tail shrink-0 px-4 pt-2 pb-5 flex gap-3 justify-between [&>button]:grow
		 [&>button>span]:align-[-30%] [&>button]:min-w-[110px] [&>button>span]:text-4xl
		 font-bold overflow-x-auto [scrollbar-width:none]"
      >
         <Button onClick={() => app.go("#search")}>
            <span class="icon--material-symbols icon--material-symbols--dictionary"></span>{" "}
            词典
         </Button>
         <Button onClick={() => app.startStudy()}>
            <span class="icon--hugeicons icon--hugeicons--online-learning-01"></span>{" "}
            学习
         </Button>
         <Button onClick={() => app.go("#setting")}>
            <span class="icon--material-symbols icon--material-symbols--settings"></span>{" "}
            设置
         </Button>
         <Button onClick={() => app.go("#about")}>
            <span class="icon--tabler icon--tabler--info-octagon"></span> 关于
         </Button>
         <Button onClick={() => app.go("#issue")}>
            <span class="icon--material-symbols icon--material-symbols--error"></span>{" "}
            问题
         </Button>
         <Button onClick={() => app.go("#help")}>
            <span class="icon--material-symbols icon--material-symbols--help-outline"></span>{" "}
            帮助
         </Button>
      </div>
   </Dialog>
);
