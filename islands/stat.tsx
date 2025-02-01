import { BLevelName, TBAggr } from "../lib/istat.ts";

interface IStatProps {
    onTitleClick: () => void;
    onItemClick: (blevel: number) => void
    title: string;
    width: number;
    total: TBAggr;
    task: TBAggr;
}
export default ({onTitleClick, onItemClick, title, width, total, task}: IStatProps) =>
    <div class="grow min-w-80 grid gap-x-1 grid-cols-[max-content_1fr] items-center">
        <div class="col-span-2 text-center font-bold">
            <a class="hover:cursor-pointer hover:underline" onClick={onTitleClick}>{title}</a>
        </div>
        {[0,1,2,3,4,5].map(blevel => {
            const value = total[blevel];
            const t = task[blevel];
            return <>
                <div class="text-left">{BLevelName[blevel]}</div>
                <div class="relative bg-slate-300 dark:bg-slate-700 h-6 py-1 w-full hover:cursor-pointer"
                    onClick={(ev: Event) => (ev.stopPropagation(), onItemClick(blevel))}>
                    <div class="my-auto h-4 bg-slate-400" style={`width: ${width ? (value * 100 / width) : 100}%`}>
                        <div class="ml-auto h-full bg-orange-500" style={`width: ${value ? (t * 100 / value) : 0}%`}/>
                    </div>
                    <div class="absolute top-0 right-1">{task}|{value}</div>
                </div>
            </>
        })}
    </div>