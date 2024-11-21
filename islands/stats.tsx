// deno-lint-ignore-file no-explicit-any
import { JSX } from "preact";
import { Tag } from "@sholvoir/vocabulary";
import { TagName } from '../lib/tag.ts';
import { iStatToIBStat } from "../lib/istat.ts";
import { startStudy } from '../lib/mem.ts';
import { signals } from "../lib/signals.ts";
import Stat from './stat.tsx';

const sum = (s: number, b: number) => s + b;

export default (props: JSX.HTMLAttributes<HTMLDivElement>) => {
    const getResult = () => {
        const result = [] as Array<any>;
        const stats = signals.stats.value;
        const push = (tag: Tag) => {
            const width = stats.all[tag].reduce(sum);
            const task = stats.task[tag].reduce(sum);
            result.push(<Stat onTitleClick={() => startStudy(tag)}
                onItemClick={(blevel) => startStudy(tag, blevel)}
                title={`${TagName[tag]} - ${task}|${width}`} width={width}
                statAll={iStatToIBStat(stats.all[tag])}
                statTask={iStatToIBStat(stats.task[tag])} />)
        };
        for (const ttag of signals.setting.value.books) push(ttag);
        return result;
    }
    return <div {...props}><div class="p-2 flex flex-wrap justify-between gap-4">{getResult()}</div></div>;
}