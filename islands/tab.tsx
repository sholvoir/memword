import { JSX } from "preact";

export default ({title, children}: JSX.HTMLAttributes<HTMLDivElement>) => <>
    <div class="shrink-0 px-2 w-[env(titlebar-area-width,100%)] ml-[env(titlebar-area-x,0)] h-[env(titlebar-area-height,38px)] [app-region:drag] bg-slate-300 dark:bg-slate-900 flex justify-center items-center font-bold">{title}</div>
    <div class="grow overflow-y-auto">{children}</div>
</>