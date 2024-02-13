import { signals } from '../lib/mem.ts';

export default () => <div class="fixed inset-0 bg-slate-300 dark:bg-slate-900 flex justify-center items-center"><div>{signals.waiting.value}</div></div>;