import { BLevel, BLevelName, BLevels, IBStat } from "../lib/istat.ts";

interface IStatProps {
    onTitleClick: () => void;
    onItemClick: (blevel: BLevel) => void
    title: string;
    width: number;
    statAll: IBStat;
    statTask: IBStat;
}
export default ({onTitleClick, onItemClick, title, width, statAll, statTask}: IStatProps) =>
    <div class="grow min-w-80 grid gap-x-1 grid-cols-[max-content_1fr] items-center">
        <div class="col-span-2 text-center font-bold">
            <a class="hover:cursor-pointer hover:underline" onClick={onTitleClick}>{title}</a>
        </div>
        {BLevels.map(blevel => {
            const value = statAll[blevel];
            const task = statTask[blevel];
            return <>
                <div class="text-left">{BLevelName[blevel]}</div>
                <div class="relative bg-slate-300 dark:bg-slate-700 h-6 py-1 w-full hover:cursor-pointer"
                    onClick={(ev: Event) => (ev.stopPropagation(), onItemClick(blevel))}>
                    <div class="my-auto h-4 bg-slate-400" style={`width: ${width ? (value * 100 / width) : 100}%`}>
                        <div class="ml-auto h-full bg-orange-500" style={`width: ${value ? (task * 100 / value) : 0}%`}/>
                    </div>
                    <div class="absolute top-0 right-1">{task}|{value}</div>
                </div>
            </>
        })}
    </div>