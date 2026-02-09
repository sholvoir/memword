import Button from "@sholvoir/solid-components/button-ripple";
import { type Accessor, For, type Setter } from "solid-js";
import type { TDial } from "src/lib/idial.ts";
import type { IItem } from "src/lib/iitem.ts";
import { splitID } from "#srv/lib/ibook.ts";
import { aggrToBAggr, type IStat, type IStats } from "../lib/istat.ts";
import * as mem from "../lib/mem.ts";
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

export default ({
   go,
   setBId,
   setCItem,
   setPhaseAnswer,
   setShowLoading,
   setSprint,
   showLoading,
   showTips,
   stats,
   totalStats,
}: {
   go: (d?: TDial) => void;
   setBId: Setter<string | undefined>;
   setCItem: Setter<IItem | undefined>;
   setPhaseAnswer: (phaseAnswer: boolean) => void;
   setShowLoading: Setter<boolean>;
   setSprint: (sprint: number) => void;
   showLoading: Accessor<boolean>;
   showTips: (tips: string) => void;
   stats: Accessor<IStats>;
   totalStats: () => void;
}) => {
   const startStudy = async (wl?: string) => {
      setShowLoading(true);
      const item = await mem.getEpisode(setBId(wl));
      setShowLoading(false);
      if (item) {
         setCItem(item);
         setPhaseAnswer(false);
         setSprint(0);
         go("#study");
      } else {
         showTips("No More Task");
         totalStats();
      }
   };
   return (
      <Dialog class="flex flex-col" title="学习进度" showLoading={showLoading}>
         <div class="body grow overflow-y-auto">
            <div class="p-2 flex flex-wrap justify-between gap-4">
               <For each={stats().stats}>
                  {(stat: IStat) => (
                     <Stat {...statInfo(stat)} startStudy={startStudy} />
                  )}
               </For>
            </div>
         </div>
         <div
            class="tail shrink-0 px-4 pt-2 pb-5 flex gap-3 justify-between [&>button]:grow
		 [&>button>span]:align-[-30%] [&>button]:min-w-[110px] [&>button>span]:text-4xl
		 font-bold overflow-x-auto [scrollbar-width:none]"
         >
            <Button onClick={() => go("#search")}>
               <span class="icon--material-symbols icon--material-symbols--dictionary"></span>{" "}
               词典
            </Button>
            <Button onClick={() => startStudy()}>
               <span class="icon--hugeicons icon--hugeicons--online-learning-01"></span>{" "}
               学习
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
      </Dialog>
   );
};
