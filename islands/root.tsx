// deno-lint-ignore-file
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Tag } from "vocabulary/tag.ts";
import { TaskType } from "../lib/itask.ts";
import { IStudy } from "../lib/istudy.ts";
import { BLevel, totalTask } from "../lib/istat.ts";
import { ISetting } from "../lib/isetting.ts";
import * as mem from '../lib/mem.ts';

import Start from './start.tsx';
import Stats from './stats.tsx';
import About from './about.tsx';
import Signin from './signin.tsx';
import Signout from './signout.tsx';
import Study from './study.tsx';
import Setting from './setting.tsx';
import Tasks from './tasks.tsx';
import Issue from './issue.tsx';
import Dict from './dict.tsx';
import Waiting from './waiting.tsx';
import Menu from './menu.tsx';
import NButton from './button-normal.tsx';

export type Loca = 'about'|'start'|'stats'|'dict'|'tasks'|'menu';
export type Dial = 'waiting'|'start'|'issue'|'study'|'setting'|'login'|'logout'

export default () => {
    if (!IS_BROWSER) return <div/>;
    const user = useSignal<string|undefined>(mem.getUser());
    const setting = useSignal<ISetting>(mem.getSetting());
    const layers = useSignal<any[]>([]);
    const loca = useSignal<Loca>('about');
    const stats  = useSignal(mem.getStats());
    const studies = useSignal<Array<IStudy>>([]);
    const tips = useSignal('');

    const goBack = () => layers.value = layers.value.slice(0, -1);
    const hideTips = () => tips.value = '';
    const showTips = (content: string) => {
        tips.value = content;
        setTimeout(hideTips, 3000);
    };
    const handleStudyClick = async (taskType?: TaskType, tag?: Tag, blevel?: BLevel) => {
        openDialog('waiting');
        const ts = await mem.getEpisode(setting.value.sprintNumber, taskType, tag, blevel);
        goBack();
        if (!ts.length) {
            showTips('Congratulations! There are no more task need to do.');
            if (!taskType && !tag && !blevel) openDialog('start');
        } else {
            studies.value = ts;
            openDialog('study')
        }
    };
    const handleSearchWord = async (word: string) => {
        openDialog('waiting');
        const ts = await mem.searchWord(word);
        goBack();
        if (!ts) showTips('Not Found!'); else {
            studies.value = [ts];
            openDialog('study');
        }
    }
    const handleStudyFinish = async () => {
        goBack();
        stats.value = await mem.updateStats();
        await mem.syncTasks();
    };
    const handleSignoutClick = async (cleanUser: boolean, cleanDict: boolean) => {
        const u = user.value;
        user.value = undefined;
        goBack();
        loca.value = 'about';
        await mem.removeAuth(cleanUser ? u : undefined, cleanDict);
    };
    const handleStartOKClick = async (types: TaskType[], tag: Tag) => {
        goBack();
        openDialog('waiting');
        await mem.addTasks(types, tag);
        goBack();
        handleStudyClick();
    };
    const handleMenuClick = (ev: Event) => openDialog((ev.target as HTMLMenuElement).title as Dial|Loca);
    const openDialog = (title: Dial|Loca) => {
        switch (title) {
            case 'waiting': return layers.value = [...layers.value, <Waiting/>];
            case 'start': return layers.value = [...layers.value, <Start setting={setting} onCancel={goBack} onStartOKClick={handleStartOKClick}/>];
            case 'issue': return layers.value = [...layers.value, <Issue showTips={showTips} onCancel={goBack}/>];
            case 'study': return layers.value = [...layers.value, <Study studies={studies} showTips={showTips} onFinish={handleStudyFinish}/>];
            case 'setting': return layers.value = [...layers.value, <Setting setting={setting} onCancel={goBack}/>];
            case 'login': return layers.value = [...layers.value, <Signin user={user} showTips={showTips} onCancel={goBack}/>];
            case 'logout': return layers.value = [...layers.value, <Signout onCancel={goBack} handleSignoutClick={handleSignoutClick}/>];
            default: loca.value = title as Loca;
        }
    };
    const home = () => { switch (loca.value) {
        case 'about': return <About handleMenuClick={handleMenuClick}/>;
        case 'stats': return <Stats setting={setting} stats={stats} onClickStatBar={handleStudyClick} />;
        case 'dict': return <Dict showTips={showTips} handleSearchWord={handleSearchWord}/>;
        case 'tasks': return <Tasks/>;
        case 'menu': return <Menu handleMenuClick={handleMenuClick}/>;
    }};
    const init = async () => {
        if (!user.value) return (loca.value = 'about', undefined);
        loca.value = 'stats';
        await mem.init(user.value);
        const s = await mem.updateSetting();
        if (s) setting.value = s;
        if (setting.value.showStartPage && totalTask(stats.value) == 0) openDialog('start');
        await mem.syncTasks();
        stats.value = await mem.updateStats();
    };
    useEffect(() => (init().catch(console.error), mem.close), []);
    return <>
        <div class="fixed top-0 inset-x-0 flex flex-col" style={`bottom:${user.value?'60px':'0'}`}>{home()}</div>
        {user.value && <div class="fixed inset-x-0 bottom-0 bg-gray-300 px-2 pb-2 flex gap-4 justify-between">
            <NButton class={`${loca.value=='stats'?'text-orange-600':'text-black'} grow`} onClick={()=>loca.value='stats'}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="w-9 h-9 inline-block" style={`fill:${loca.value=='stats'?'#E61':'#000'}`}><path d="m 122.1047,52.674247 c 1.04543,1.15326 1.8953,0.763881 1.8953,-0.8644 V 9.6606997 c 0,-3.0177815 -2.62711,-5.6606991 -5.35348,-5.6606991 H 80.563999 c -1.479768,0 -1.833633,0.9351639 -0.78556,2.0884238 L 93.32424,21.005323 87.799265,27.058304 62.174241,55.281602 48.620525,40.370872 c -1.048073,-1.15326 -2.742535,-1.150356 -3.790608,0 L 7.1391902,81.874078 c -4.1873455,4.610499 -4.1847072,12.082375 0.00264,16.689609 l 0.2628427,0.292125 c 4.1873461,4.607598 10.9777251,4.607598 15.1621021,-0.0029 L 46.722913,72.257893 60.276628,87.15701 c 1.048073,1.150356 2.745173,1.150356 3.793246,0 L 108.74951,37.984517 Z M 20.49701,113.25668 16.8835,117.23902 c -1.045435,1.15326 -1.892666,3.13282 -1.892666,4.4247 V 124 h 12.489483 v -15.48954 c 0,-1.62828 -0.847231,-2.01475 -1.895304,-0.86149 z M 50.963684,89.062538 c -1.048073,-1.150357 -1.897942,-0.763881 -1.897942,0.8644 v 34.069792 h 11.18945 v -21.7842 c 0,-1.62828 -0.804358,-3.831739 -1.798676,-4.920042 L 56.657841,95.322003 Z M 67.67514,95.3191 c 0,0 -0.498642,0.55159 -1.11502,1.230192 -0.61374,0.678602 -1.112382,2.55147 -1.112382,4.179748 v 23.26769 h 11.18945 V 88.416596 c 0,-1.628281 -0.84987,-2.017661 -1.897943,-0.864401 z M 100.1067,59.609048 c -1.048069,1.150357 -1.897939,3.403895 -1.897939,5.032176 V 123.99637 H 108.61265 V 53.214225 c 0,-1.628281 -0.84987,-2.01766 -1.89794,-0.8644 z M 83.727346,77.658764 c -1.045435,1.15326 -1.895304,3.407161 -1.895304,5.038345 v 41.302531 h 11.18945 V 70.369783 c 0,-1.628281 -0.847231,-2.014757 -1.895304,-0.861497 z M 34.57905,97.752631 c -1.048073,1.15326 -1.895304,3.406799 -1.895304,5.035079 v 21.20866 h 11.18945 V 90.475263 c 0,-1.628281 -0.847231,-2.017661 -1.895304,-0.864401 z" /></svg>进度</NButton>
            <NButton class="grow" onClick={() => handleStudyClick()}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="w-9 h-9 inline-block" style="fill:#000;stroke:#000;stroke-width:3"><path d="m 63.990961,47.795914 c 10.134397,0 18.384649,-8.250521 18.384649,-18.384648 0,-10.134127 -8.250522,-18.36738 -18.384649,-18.36738 -10.134127,0 -18.384648,8.250521 -18.384648,18.384648 0,10.134127 8.250252,18.36738 18.384648,18.36738 z m 0,-30.873754 c 6.907363,0 12.506645,5.616549 12.506645,12.506644 0,6.890095 -5.61655,12.506644 -12.506645,12.506644 -6.890094,0 -12.506644,-5.616549 -12.506644,-12.506644 0,-6.890095 5.599281,-12.506644 12.506644,-12.506644 z"/><path d="m 108.10392,71.622809 h -2.25002 l 1.06389,-14.739125 c 0.0872,-1.098973 -0.45356,-2.1456 -1.41277,-2.738662 C 93.260103,46.71448 77.195357,47.63888 63.973693,56.342697 50.769567,47.656148 34.687283,46.731749 22.442363,54.145022 c -0.941938,0.558255 -1.482655,1.622151 -1.412772,2.738662 l 1.063896,14.739125 H 19.878274 C 16.633972,71.622809 14,74.274049 14,77.501083 v 9.174921 c 0,3.244302 2.651241,5.878274 5.878274,5.878274 h 3.732675 c 0.523178,7.221432 1.046627,14.407792 1.569806,21.629222 0.139496,2.19767 2.965309,3.8549 5.006219,1.88387 9.157383,-9.10503 22.483737,-11.77381 32.426292,-6.47133 1.081434,0.43603 1.988565,0.38368 2.773468,0 9.942286,-5.32002 23.286178,-2.65124 32.426292,6.47133 2.023372,2.09326 5.023484,0.0872 5.006224,-1.88387 0.50591,-7.22143 1.04662,-14.40779 1.5698,-21.629222 h 3.73268 c 3.2443,0 5.87827,-2.65124 5.87827,-5.878274 v -9.174921 c -0.0181,-3.227034 -2.63424,-5.878274 -5.89608,-5.878274 z M 28.634166,82.978136 c 0,2.04091 -1.674495,3.715406 -3.715405,3.715406 h -5.040757 v -9.174921 h 5.058295 c 2.04091,0 3.715406,1.674496 3.715406,3.715406 v 1.744379 z M 61.04292,102.54891 c -9.802789,-3.27938 -21.245268,-1.20366 -30.420189,5.44225 -0.40122,-5.47706 -0.784903,-10.97165 -1.186123,-16.448703 v -0.10469 c 3.017654,-1.604612 5.093371,-4.796839 5.093371,-8.4599 v -1.744379 c 0,-4.18624 -2.703586,-7.76215 -6.471336,-9.052693 L 27.06436,58.331262 c 10.169204,-5.320019 23.181488,-4.133895 33.97856,3.122344 z m 36.316001,5.44225 C 88.184,101.34552 76.741522,99.2698 66.938732,102.54891 V 85.036315 h 5.791123 c 1.622151,0 2.947771,-1.308082 2.947771,-2.947771 0,-1.63969 -1.308082,-2.947772 -2.947771,-2.947772 h -5.791123 v -5.320018 h 12.907596 c 1.622151,0 2.947771,-1.308082 2.947771,-2.947771 0,-1.622151 -1.308352,-2.947772 -2.947771,-2.947772 H 66.956001 v -6.506142 c 10.81461,-7.256239 23.826895,-8.442363 33.978559,-3.104806 l -0.994282,13.849533 c -3.750212,1.290814 -6.471335,4.866453 -6.471335,9.052693 v 1.744379 c 0,3.663061 2.058178,6.83748 5.09337,8.459901 2.7e-4,0.01727 -0.819439,11.232831 -1.203392,16.570391 z m 5.686429,-21.315156 c -2.04091,0 -3.715402,-1.674496 -3.715402,-3.715406 v -1.744379 c 0,-2.04091 1.674492,-3.715406 3.715402,-3.715406 h 5.0583 v 9.174921 h -5.0583 z"/></svg>学习</NButton>
            <NButton class={`${loca.value=='dict'?'text-orange-600':'text-black'} grow`} onClick={()=>loca.value="dict"}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="w-9 h-9 inline-block" style={`fill:${loca.value=='dict'?'#E61':'#000'}`}><path style="stroke-width:3" d="m 18.937552,93.370855 c 0.121527,-26.896279 0.240017,-53.753846 0.355469,-80.572703 0.0102,-1.77989 1.006546,-3.3022949 2.378905,-3.6349461 v 0 C 29.328172,7.1308874 41.395874,7.6418706 49.58988,11.64844 c 5.770387,2.654859 10.828546,7.347479 14.583325,13.529433 3.875033,-5.886033 8.907794,-10.354702 14.583326,-12.94877 7.738277,-3.7626921 19.477855,-4.6685248 27.890599,-3.0658971 1.43556,0.2479456 2.51071,1.8008211 2.52475,3.6465591 v 0 80.897874 c -0.005,2.063395 -1.32459,3.729106 -2.94402,3.716235 -0.22711,-0.0037 -0.45322,-0.03911 -0.67447,-0.104515 -7.184361,-1.187638 -14.486159,-0.31878 -21.373685,2.543295 -5.088118,2.416486 -9.917298,5.639336 -14.37369,9.592546 6.266515,-2.47774 12.798449,-3.69244 19.359364,-3.60011 8.41908,0.17071 16.797601,1.52607 24.983061,4.04141 V 25.235938 h 2.92577 c 1.61586,0 2.92579,1.669017 2.92579,3.727852 v 85.81028 c 0,2.05883 -1.30993,3.72785 -2.92579,3.72785 -0.31014,-0.004 -0.61788,-0.0699 -0.91145,-0.19743 -8.81731,-3.08925 -17.900477,-4.77824 -27.042953,-5.02853 -8.079423,-0.12984 -16.086453,1.95335 -23.479155,6.10857 -1.012125,0.82063 -2.305581,0.82063 -3.317706,0 -7.392441,-4.15627 -15.399652,-6.2395 -23.479155,-6.10857 -9.121835,0.26455 -18.183261,1.96126 -26.979152,5.05176 -0.293572,0.12752 -0.601305,0.19417 -0.911458,0.19742 -1.6336902,0.0195 -2.9633735,-1.66947 -2.9531226,-3.75107 V 28.96379 c 0,-2.058835 1.3099162,-3.727852 2.9257796,-3.727852 h 2.925779 V 109.8965 c 8.185457,-2.51534 16.563972,-3.8707 24.98306,-4.04141 7.033347,-0.10607 14.030631,1.29545 20.699207,4.14594 -4.212321,-4.34118 -9.0128,-7.66314 -14.164054,-9.80159 -6.380205,-2.671042 -16.114575,-3.565259 -23.233061,-2.787177 -1.624667,0.201468 -3.064508,-1.329944 -3.199217,-3.402681 -0.0092,-0.212744 -0.0092,-0.425983 0,-0.638727 z M 103.30209,16.131154 c -6.763014,-0.812927 -16.460928,0.139358 -22.540352,3.07751 -5.651534,2.524245 -10.496382,7.342702 -13.790358,13.715244 v 69.981422 c 4.736678,-4.136524 9.855036,-7.514293 15.239576,-10.057076 6.805672,-2.77746 13.959135,-3.907914 21.091134,-3.332999 z M 61.119821,102.18531 V 32.819389 C 58.057323,25.932733 53.108107,21.333888 47.511756,18.604775 41.131551,15.504039 31.333379,14.807244 25.126351,15.933728 l -0.328125,73.813797 c 6.772132,-0.313563 16.12369,0.789693 22.348947,3.37945 5.001922,2.066008 9.717245,5.122907 13.972648,9.058335 z" /><path d="m 46.601932,50.571761 c -1.248,3.52 -3.008,6.432 -5.216,8.864 -2.464,-2.528 -4.384,-5.504 -5.76,-8.864 z m 9.184,0 v -3.712 h -13.92 l 2.752,-0.864 c -0.384,-1.312 -1.344,-3.36 -2.176,-4.832 l -4.064,1.184 c 0.736,1.408 1.44,3.2 1.792,4.512 h -13.504 v 3.712 h 5.024 c 1.728,4.512 3.936,8.352 6.816,11.52 -3.328,2.592 -7.456,4.416 -12.448,5.664 0.768,0.864 1.888,2.656 2.304,3.552 5.152,-1.472 9.44,-3.584 12.96,-6.464 3.36,2.816 7.488,4.928 12.512,6.272 0.576,-1.056 1.696,-2.72 2.56,-3.552 -4.768,-1.12 -8.8,-2.976 -12.096,-5.536 2.784,-3.104 4.96,-6.848 6.592,-11.456 z"/><path d="m 85.284133,58.31576 0.704,-2.592 c 0.704,-2.464 1.408,-5.152 2.016,-7.744 h 0.128 c 0.704,2.56 1.344,5.28 2.08,7.744 l 0.704,2.592 z m 8.32,9.76 h 4.96 l -7.616,-23.68 h -5.568 l -7.584,23.68 h 4.8 l 1.664,-6.08 h 7.68 z" /></svg>词典</NButton>
            <NButton class={`${loca.value=='menu'?'text-orange-600':'text-black'} grow`} onClick={()=>loca.value="menu"}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-9 h-9 inline-block"  style={`fill:none;stroke:${loca.value=='menu'?'#E61':'#000'};stroke-width:5`}><ellipse cx="32" cy="20" rx="15" ry="15"/><path d="M 3,57 A 28 28 0 0 1 61 57 Z"/></svg>我</NButton>
        </div>}
        {layers.value}
        <div class="fixed top-0 inset-x-0 text-center" style="background-color:#ff08" onClick={hideTips}>{tips.value}</div>
    </>;
}