import { JSX } from "preact";

export default ({title, children}: JSX.HTMLAttributes<HTMLDivElement>) => <>
    <div class="p-2 text-center bg-gray-800 text-white font-bold">{title}</div>
    <div class="p-2 grow overflow-y-auto">{children}</div>
</>