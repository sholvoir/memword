import { For } from "solid-js";
import { BLevelName, type TBAggr } from "../lib/istat.ts";
import * as app from "./app.tsx";

const BlevelBar = (props: {
	blevel: number;
	totals: TBAggr;
	tasks: TBAggr;
	width: number;
}) => (
	<>
		<div class="text-left">{BLevelName[props.blevel]}</div>
		<div class="relative bg-[var(--bg-title)] h-6 py-1 w-full hover:cursor-pointer">
			<div
				class="my-auto h-4 bg-slate-400"
				style={{
					width: `${
						props.width ? (props.totals[props.blevel] * 100) / props.width : 100
					}%`,
				}}
			>
				<div
					class="ml-auto h-full bg-orange-500"
					style={{
						width: `${
							props.totals[props.blevel]
								? (props.tasks[props.blevel] * 100) / props.totals[props.blevel]
								: 0
						}%`,
					}}
				/>
			</div>
			<div class="absolute top-0 right-1">
				{props.tasks[props.blevel]}|{props.totals[props.blevel]}
			</div>
		</div>
	</>
);

export default (props: {
	bid: string;
	totals: TBAggr;
	tasks: TBAggr;
	width: number;
	title: string;
}) => (
	<div class="grow min-w-80 grid gap-x-1 grid-cols-[max-content_1fr] items-center">
		<div class="col-span-2 text-center font-bold">
			<button
				type="button"
				class="hover:cursor-pointer hover:underline"
				onClick={() => app.startStudy(props.bid)}
			>
				{props.title}
			</button>
		</div>
		<For each={[0, 1, 2, 3, 4, 5]}>
			{(blevel) => (
				<BlevelBar
					blevel={blevel}
					totals={props.totals}
					tasks={props.tasks}
					width={props.width}
				/>
			)}
		</For>
	</div>
);
