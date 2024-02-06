import { JSX } from "preact";

export default ({title, children}: JSX.HTMLAttributes<HTMLDivElement>) => <>
    <div class="px-2 pb-2 text-center bg-slate-300 dark:bg-slate-900 font-bold">{title}</div>
    <div class="grow overflow-y-auto">{children}</div>
</>