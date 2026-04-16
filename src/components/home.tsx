import Button from "@sholvoir/solid-components/button-ripple";
import { type Accessor, For, type Setter } from "solid-js";
import type { IItem } from "src/lib/iitem.ts";
import { splitID } from "../lib/ibook.ts";
import { aggrToBAggr, type IStat, type IStats } from "../lib/istat.ts";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog.tsx";
import { useG } from "./g-provider.tsx";
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

export default (props: {
   setBId: Setter<string | undefined>;
   setCItem: Setter<IItem | undefined>;
   setPhaseAnswer: (phaseAnswer: boolean) => void;
   setSprint: (sprint: number) => void;
   stats: Accessor<IStats>;
   totalStats: () => void;
}) => {
   const { go, showTips, showLoading } = useG()!;
   const startStudy = async (wl?: string) => {
      showLoading(true);
      const item = await mem.getEpisode(props.setBId(wl));
      showLoading(false);
      if (item) {
         props.setCItem(item);
         props.setPhaseAnswer(false);
         props.setSprint(0);
         go("#study");
      } else {
         showTips("No More Task");
         props.totalStats();
      }
   };
   return (
      <Dialog
         class="overflow-y-auto"
         title="学习进度"
         noleft={true}
         bottom={
            <div
               class="tail shrink-0 px-4 pt-2 pb-5 flex gap-2 justify-between [&>button]:grow
		            [&>button>span]:align-[-30%] [&>button]:min-w-20 [&>button>span]:text-4xl
		            font-bold overflow-x-auto [scrollbar-width:none]"
            >
               <Button onClick={() => go("#trans")}>
                  <span class="icon--hugeicons icon--hugeicons--translate"></span>{" "}
                  翻译
               </Button>
               <Button onClick={() => startStudy()}>
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
            <For each={props.stats().stats}>
               {(stat: IStat) => (
                  <Stat {...statInfo(stat)} startStudy={startStudy} />
               )}
            </For>
         </div>
      </Dialog>
   );
};
