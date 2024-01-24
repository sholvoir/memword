import { JSX } from "preact";

export default ({title, children}: JSX.HTMLAttributes<HTMLDivElement>) => <div class="[&>*]:p-2">
    <div class="p-2 text-center bg-gray-800 text-white font-bold">{title}</div>
    {children}
</div>