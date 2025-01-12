import { type Dial, showDialog, closeDialog, showTips, totalStats } from '../lib/signals.ts';
import * as mem from "../lib/mem.ts";
import Dialog from './dialog.tsx';

export default () => {
    const open = (e: Event) => showDialog((e.target as HTMLMenuElement).title as Dial);
    const cache = () => (mem.cacheDict(), showTips('后台开始缓存……'));
    const down = async () => {
        await mem.downTasks();
        await totalStats();
        closeDialog();
    }
    return <Dialog title="菜单">
        <div class="p-2 [&>menu]:p-2 [&>menu]:cursor-pointer [&>div]:h-px [&>div]:bg-slate-500">
            <menu title="issue" onClick={open}>报告问题</menu>
            <div/>
            <menu title="add" onClick={open}>添加任务</menu>
            <div/>
            <menu onClick={cache}>缓存辞典</menu>
            <div/>
            <menu onClick={down}>完全同步</menu>
            <div/>
            <menu title="setting" onClick={open}>设置</menu>
            <div/>
            <menu title="about" onClick={open}>关于</menu>
            <div/>
            <menu title="help" onClick={open}>帮助</menu>
            <div/>
            <menu title="logout" onClick={open}>登出</menu>
        </div>
    </Dialog>
}