// deno-lint-ignore-file no-explicit-any
import { JSX } from "preact";
import { Tag } from "@sholvoir/vocabulary";
import { TagName } from '../lib/tag.ts';
import { TaskType, TaskTypeName } from "../lib/itask.ts";
import { iStatToIBStat } from "../lib/istat.ts";
import { signals, startStudy } from '../lib/mem.ts';
import Stat from './stat.tsx';

const sum = (s: number, b: number) => s + b;

export default (props: JSX.HTMLAttributes<HTMLDivElement>) => {
    const getResult = () => {
        const result = [] as Array<any>;
        const stats = signals.stats.value;
        const push = (ttag: string) => {
            const type = ttag[0] as TaskType;
            const tag = ttag.slice(1) as Tag;
            const width = stats.all[ttag].reduce(sum);
            const task = stats.task[ttag].reduce(sum);
            result.push(<Stat onTitleClick={() => startStudy(type, tag)}
                onItemClick={(blevel) => startStudy(type, tag, blevel)}
                title={`${TaskTypeName[type]}-${TagName[tag]} - ${task}|${width}`} width={width}
                statAll={iStatToIBStat(stats.all[ttag])}
                statTask={iStatToIBStat(stats.task[ttag])} />)
        };
        for (const ttag of signals.setting.value.books) push(ttag);
        return result;
    }
    return <div {...props}><div class="p-2 flex flex-wrap justify-between gap-4">{getResult()}</div></div>;
}