// deno-lint-ignore-file
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Tag } from "vocabulary/tag.ts";
import { ITask, TaskType } from "../lib/itask.ts";
import { BLevel } from "../lib/istat.ts";
import * as mem from '../lib/mem.ts';

import Stats from './stats.tsx';
import About from './about.tsx';
import Signin from './signin.tsx';
import Study from './study.tsx';
import Setting from './setting.tsx';
import Dialog from './dialog.tsx';
import Tasks from './tasks.tsx';
import Issue from './issue.tsx';
import Dict from './dict.tsx';

export type Loca = 'empty'|'about'|'login'|'stat'|'study'|'setting'|'dialog'|'tasks'|'issue'|'dict';
export type ShowDialog = (content: string, backLoca: Loca) => void;

export default () => {
    if (!IS_BROWSER) return <div/>;
    const isLogin = useSignal(false);
    const isMenuToggle = useSignal(false);
    const loca = useSignal<Loca>('empty');
    const stats  = useSignal(mem.getStats());
    const tasks = useSignal<Array<ITask>>([]);
    const dialogContent = useSignal('');
    const preLoca = useSignal<Loca>('stat');

    const showDialog = (content: string, backLoca: Loca = 'empty') => {
        dialogContent.value = content;
        preLoca.value = backLoca;
        loca.value = 'dialog';
    }
    const handleClickMenu = (event: Event) => {
        event.stopPropagation();
        if (isMenuToggle.value = !isMenuToggle.value) window.addEventListener('click', handleClickBlank);
        else removeEventListener('click', handleClickBlank);
    };
    const handleClickBlank = () => {
        isMenuToggle.value = false;
        removeEventListener('click', handleClickBlank);
    };
    const handleClickLogo = () => {
        loca.value = 'about';
    }
    const handleClickMenuStatis = async () => {
        loca.value = 'stat';
        stats.value = await mem.updateStats();
    };
    const handleClickMenuSetting = () => {
        loca.value = 'setting';
    };
    const handleClickMenuLogout = () => {
        mem.removeAuth();
        isLogin.value = false;
        isMenuToggle.value = false;
        loca.value = 'about';
    };
    const handleClickStatBar = async (taskType?: TaskType, tag?: Tag, blevel?: BLevel) => {
        startStudy(await mem.getEpisode(taskType, tag, blevel));
    };
    const handleStudyFinish = async () => {
        await handleClickMenuStatis();
        await mem.syncTasks();
    };
    const startStudy = async (ts: Array<ITask>) => {
        tasks.value = ts;
        loca.value = 'study';
    }
    const home = () => {
        switch (loca.value) {
            case 'empty': return <div/>
            case 'about': return <About/>;
            case 'login': return <Signin showDialog={showDialog}/>;
            case 'stat': return <Stats stats={stats} onClickStatBar={handleClickStatBar} />;
            case 'study': return <Study tasks={tasks} onFinish={handleStudyFinish}/>;
            case 'setting': return <Setting onFinished={handleClickMenuStatis}/>;
            case 'dialog': return <Dialog content={dialogContent.value} onFinish={() => loca.value = preLoca.value }/>;
            case 'tasks': return <Tasks/>
            case 'issue': return <Issue showDialog={showDialog} />
            case 'dict': return <Dict showDialog={showDialog} startStudy={startStudy}/>
        }
    };

    const init = async () => {
        if (!mem.user) return loca.value = 'about';
        isLogin.value = true;
        loca.value = 'stat';
        await mem.init();
        await mem.syncTasks();
        stats.value = await mem.updateStats();
    };
    useEffect(() => (init().catch(console.error), mem.close), []);
    return <div class="h-full flex flex-col">
        <div class={`flex bg-gray-200 px-2 py-1 justify-between`}>
            <img class="h-12" src="/favicon.svg" onClick={handleClickLogo}/>
            {isLogin.value ? <div class="relative">
                <button id="appbardropdown"
                    class="w-12 h-full bg-[url('/head.svg')]"
                    onClick={handleClickMenu}></button>
                <div class={`absolute ${isMenuToggle.value ? 'block' : 'hidden'} w-32 right-0 bg-gray-200 rounded p-2 mt-[-2px] [&>menu]:p-2 [&>menu]:hover:cursor-pointer [&>div]:h-px [&>div]:bg-gray-300`}>
                    <menu onClick={handleClickMenuStatis}>Status</menu>
                    <menu onClick={() => handleClickStatBar()}>Study</menu>
                    <menu onClick={() => loca.value = 'dict'}>Dict</menu>
                    <div/>
                    <menu onClick={handleClickMenuSetting}>Setting</menu>
                    <div/>
                    <menu onClick={() => loca.value = 'issue'}>Report Issue</menu>
                    <div/>
                    <menu onClick={handleClickMenuLogout}>Logout</menu>
                </div>
            </div> : <button class="px-4 ml-2 bg-indigo-700 text-white rounded" onClick={() => loca.value = 'login'}>Login</button>}
        </div>
        <div class="grow p-2 overflow-y-auto">{home()}</div>
    </div>;
}