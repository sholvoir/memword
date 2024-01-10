// deno-lint-ignore-file
import { IS_BROWSER } from "$fresh/runtime.ts";
import { JSX } from "preact/jsx-runtime";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Tag } from "vocabulary/tag.ts";
import { ITask, TaskType } from "../lib/itask.ts";
import { BLevel } from "../lib/istat.ts";
import * as mem from '../lib/mem.ts';

import Stats from './stats.tsx';
import About from './about.tsx';
import Study from './study.tsx';
import Setting from './setting.tsx';

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
export type Loca = 'empty'|'about'|'stat'|'study'|'setting';

export default () => {
    if (!IS_BROWSER) return <div/>;
    const isLogin = useSignal(false);
    const isMenuToggle = useSignal(false);
    const email = useSignal(mem.getUser() ?? '');
    const loca = useSignal<Loca>('empty');
    const stats  = useSignal(mem.getStats());
    const tasks = useSignal<Array<ITask>>([]);
    const dialogContent = useSignal('');

    const handleEmailChange = ({ target }: Event) => email.value = (target as HTMLInputElement).value;
    const handleClickSignup = async () => {
        if (!emailPattern.test(email.value)) dialogContent.value = 'Invalid email address';
        else try {
            await mem.signup(email.value);
            dialogContent.value = 'The Active Email have alread sent to you from MemWord<memword.sholvoir@gmail.com>.';
        } catch (e) { dialogContent.value = e.message; }
    };
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
        tasks.value = await mem.getEpisode(taskType, tag, blevel);
        loca.value = 'study';
    };
    const handleStudyFinish = async () => {
        await mem.putTasks(tasks.value);
        await handleClickMenuStatis();
        await mem.syncTasks();
    };
    const home = () => {
        switch (loca.value) {
            case 'empty': return <div/>
            case 'about': return <About/>;
            case 'stat': return <Stats stats={stats} onClickStatBar={handleClickStatBar} />;
            case 'study': return <Study tasks={tasks} onFinish={handleStudyFinish}/>;
            case 'setting': return <Setting onFinished={handleClickMenuStatis}/>;
        }
    };
    const init = async () => {
        const email = mem.getUser();
        if (!email) return loca.value = 'about';
        await mem.initVocabulary();
        isLogin.value = true;
        loca.value = 'stat';
        if (await mem.openDatabase()) await mem.initTasks();
        await mem.syncTasks();
        stats.value = await mem.updateStats();
    }
    const cleanup = async () => {
        await mem.syncTasks();
        localStorage.setItem('_test', Date.now().toString());
        mem.closeDatabase();
    }
    useEffect(() => { init().catch(console.error); return () => cleanup().then(()=>{}); }, []);
    return <div class="h-full flex flex-col">
        <div class={`flex bg-gray-200 flex-none px-2 py-1`}>
            <img class="flex-none h-12" src="/logo.svg" onClick={handleClickLogo}/>
            <div class="flex-1"></div>
            {!isLogin.value && <input type="email" placeholder="Your Email"
                class="w-64 px-2 rounded border border-gray-500"
                value={email} onInput={handleEmailChange} />}
            {!isLogin.value && <button
                class="w-32 ml-2 bg-indigo-700 text-white rounded"
                onClick={handleClickSignup}>Signup</button>}
            {isLogin.value && <div class="relative flex-none">
                <button id="appbardropdown" class="w-12 h-full bg-[url('/head.svg')]" onClick={handleClickMenu}></button>
                <div class={`absolute ${isMenuToggle.value ? 'block' : 'hidden'} right-0 bg-gray-200 rounded p-2 mt-[-2px] [&>button]:p-2 [&>div]:h-px [&>div]:bg-gray-300`}>
                    <button onClick={handleClickMenuStatis}>Status</button>
                    <button onClick={() => handleClickStatBar()}>Study</button>
                    <div/>
                    <button onClick={handleClickMenuSetting}>Setting</button>
                    <div/>
                    <button onClick={handleClickMenuLogout}>Logout</button>
                </div>
            </div>}
            {dialogContent.value && <div class="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
                <div class="size-fit max-w-[80%] p-3 rounded-md bg-white">
                    <div class="m-6 leading-loose text-center">{dialogContent}</div>
                    <div class="m-6 text-center">
                        <button class="w-32 h-12 bg-indigo-700 text-white rounded"
                            onClick={() => dialogContent.value = ''}>确定</button>
                    </div>
                </div>
            </div>}
        </div>
        <div class="flex-1 p-2 overflow-y-auto">{home()}</div>
    </div>;
}