import { showDialog } from '../lib/mem.ts';
import Dialog from './dialog.tsx';

export default () => {
    return <Dialog title="菜单">
        <div class="p-2 [&>menu]:p-2 [&>menu]:cursor-pointer [&>div]:h-px [&>div]:bg-slate-500">
            <menu onClick={()=>showDialog({dial: 'issue'})}>报告问题</menu>
            <div/>
            <menu onClick={()=>showDialog({dial: 'start'})}>学习词书</menu>
            <div/>
            <menu onClick={()=>showDialog({dial: 'setting'})}>设置</menu>
            <div/>
            <menu onClick={()=>showDialog({dial: 'about'})}>关于</menu>
            <div/>
            <menu onClick={()=>showDialog({dial: 'help'})}>帮助</menu>
            <div/>
            <menu onClick={()=>showDialog({dial: 'logout'})}>登出</menu>
        </div>
    </Dialog>
}