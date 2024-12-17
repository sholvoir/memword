import { signals } from "../lib/signals.ts";

export default () => <div class="fixed inset-0 bg-slate-300 dark:bg-slate-900 flex justify-center items-center">
    <div>{signals.waitPrompt.value}</div>
</div>;