// deno-lint-ignore-file
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Tag } from "vocabulary/tag.ts";
import { TaskType } from "../lib/itask.ts";
import { IStudy } from "../lib/istudy.ts";
import { BLevel } from "../lib/istat.ts";
import { ISetting } from "../lib/isetting.ts";
import * as mem from '../lib/mem.ts';

import Stats from './stats.tsx';
import About from './about.tsx';
import Signin from './signin.tsx';
import Signout from './signout.tsx';
import Study from './study.tsx';
import Setting from './setting.tsx';
import Dialog from './dialog.tsx';
import Tasks from './tasks.tsx';
import Issue from './issue.tsx';
import Dict from './dict.tsx';
import Waiting from './waiting.tsx';

export type Loca = 'waiting'|'about'|'login'|'logout'|'stats'|'study'|'setting'|'dialog'|'tasks'|'issue'|'dict';
export type ShowDialog = (content: string, backLoca: Loca) => void;

export default () => {
    if (!IS_BROWSER) return <div/>;
    const user = useSignal<string|undefined>(mem.getUser());
    const setting = useSignal<ISetting>(mem.getSetting());
    const isMenuToggle = useSignal(false);
    const loca = useSignal<Loca>('about');
    const stats  = useSignal(mem.getStats());
    const studies = useSignal<Array<IStudy>>([]);
    const dialogContent = useSignal('');
    const preLoca = useSignal<Loca>('stats');
    const tips = useSignal('');

    const goBack = () => loca.value = preLoca.value;
    const showDialog = (content: string, backLoca: Loca = 'stats') => {
        dialogContent.value = content;
        preLoca.value = backLoca;
        loca.value = 'dialog';
    }
    const showTips = (content: string) => {
        tips.value = content;
        setTimeout(hideTips, 3000);
    };
    const hideTips = () => tips.value = '';
    const handleClickMenu = (event: Event) => {
        event.stopPropagation();
        if (isMenuToggle.value = !isMenuToggle.value) window.addEventListener('click', handleClickBlank);
        else removeEventListener('click', handleClickBlank);
    };
    const handleClickBlank = () => {
        isMenuToggle.value = false;
        removeEventListener('click', handleClickBlank);
    };
    const handleClickMenuStatus = async () => {
        loca.value = 'stats';
        stats.value = await mem.updateStats();
    };
    const handleClickStatBar = async (taskType?: TaskType, tag?: Tag, blevel?: BLevel) => {
        loca.value = 'waiting';
        const ts = await mem.getEpisode(setting.value.sprintNumber, taskType, tag, blevel);
        if (ts.length) return startStudy(ts);
        showDialog('Congratulations! There are no more task need to do. You can click one word book\'s NEVER BAR to study some new word!', 'stats');
    };
    const handleStudyFinish = async () => {
        await handleClickMenuStatus();
        await mem.syncTasks();
    };
    const startStudy = async (ts: Array<IStudy>) => {
        studies.value = ts;
        loca.value = 'study';
    }
    const home = () => {
        switch (loca.value) {
            case 'waiting': return <Waiting/>
            case 'about': return <About/>;
            case 'login': return <Signin user={user} showTips={showTips} showDialog={showDialog}/>;
            case 'logout': return <Signout user={user} loca={loca}/>
            case 'stats': return <Stats setting={setting} stats={stats} onClickStatBar={handleClickStatBar} />;
            case 'study': return <Study studies={studies} showTips={showTips} onFinish={handleStudyFinish}/>;
            case 'setting': return <Setting setting={setting} onFinished={goBack}/>;
            case 'dialog': return <Dialog content={dialogContent.value} onFinish={goBack}/>;
            case 'tasks': return <Tasks/>
            case 'issue': return <Issue showDialog={showDialog} />
            case 'dict': return <Dict showTips={showTips} startStudy={startStudy}/>
        }
    };
    const init = async () => {
        if (!user.value) return loca.value = 'about';
        loca.value = 'stats';
        await mem.init(user.value);
        const s = await mem.updateSetting();
        if (s) setting.value = s;
        await mem.syncTasks();
        stats.value = await mem.updateStats();
    };
    useEffect(() => (init().catch(console.error), mem.close), []);
    return <div class="h-full flex flex-col">
        <div class={`flex bg-gray-200 px-2 py-1 gap-2`}>
            <img class="h-12" src="/favicon.svg" onClick={() => loca.value = 'about'}/>
            <div class="grow text-center" style={tips.value ? 'background-color: #ff08' : ''} onClick={hideTips}>{tips.value}</div>
            {user.value ? <div class="relative">
                <button id="appbardropdown"
                    class="w-12 h-full bg-[url('/head.svg')]"
                    onClick={handleClickMenu}></button>
                <div class={`absolute z-50 ${isMenuToggle.value ? 'block' : 'hidden'} w-32 right-0 bg-gray-200 rounded p-2 mt-[-2px] [&>menu]:p-2 [&>menu]:hover:cursor-pointer [&>div]:h-px [&>div]:bg-gray-300`}>
                    <menu onClick={handleClickMenuStatus}>学习情况</menu>
                    <menu onClick={() => handleClickStatBar()}>开始学习</menu>
                    <menu onClick={() => loca.value = 'dict'}>词典</menu>
                    <div/>
                    <menu onClick={() => loca.value = 'setting'}>设置</menu>
                    <div/>
                    <menu onClick={() => loca.value = 'issue'}>报告问题</menu>
                    <div/>
                    <menu onClick={() => loca.value = 'logout'}>登出</menu>
                </div>
            </div> : <button class="px-4 ml-2 rounded bg-indigo-700 text-white active:bg-indigo-950" onClick={() => loca.value = 'login'}>登录</button>}
        </div>
        <div class="grow p-2 overflow-y-auto">{home()}</div>
    </div>;
}