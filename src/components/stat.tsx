import { For } from "solid-js";
import { BLevelName, type TBAggr } from "../lib/istat.ts";

const BlevelBar = ({
   blevel,
   totals,
   tasks,
   width,
}: {
   blevel: number;
   totals: TBAggr;
   tasks: TBAggr;
   width: number;
}) => (
   <>
      <div class="text-left">{BLevelName[blevel]}</div>
      <div class="relative bg-[var(--bg-title)] h-6 py-1 w-full hover:cursor-pointer">
         <div
            class="my-auto h-4 bg-slate-400"
            style={{
               width: `${width ? (totals[blevel] * 100) / width : 100}%`,
            }}
         >
            <div
               class="ml-auto h-full bg-orange-500"
               style={{
                  width: `${
                     totals[blevel] ? (tasks[blevel] * 100) / totals[blevel] : 0
                  }%`,
               }}
            />
         </div>
         <div class="absolute top-0 right-1">
            {tasks[blevel]}|{totals[blevel]}
         </div>
      </div>
   </>
);

export default ({
   bid,
   startStudy,
   tasks,
   title,
   totals,
   width,
}: {
   bid: string;
   startStudy: (wl?: string) => void;
   tasks: TBAggr;
   title: string;
   totals: TBAggr;
   width: number;
}) => (
   <div class="grow min-w-80 grid gap-x-1 grid-cols-[max-content_1fr] items-center">
      <div class="col-span-2 text-center font-bold">
         <button
            type="button"
            class="hover:cursor-pointer hover:underline"
            onClick={() => startStudy(bid)}
         >
            {title}
         </button>
      </div>
      <For each={[0, 1, 2, 3, 4, 5]}>
         {(blevel) => (
            <BlevelBar
               blevel={blevel}
               totals={totals}
               tasks={tasks}
               width={width}
            />
         )}
      </For>
   </div>
);
