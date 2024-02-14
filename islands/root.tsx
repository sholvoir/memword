// deno-lint-ignore-file
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useComputed, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { IStudy } from "../lib/istudy.ts";
import { ISetting } from "../lib/isetting.ts";
import { signals, startStudy, getUser, getSetting, getStats, showDialog, hideTips, init, close, IDialog } from "../lib/mem.ts";
import Start from './start.tsx';
import Stats from './stats.tsx';
import About from './about.tsx';
import Help from './help.tsx';
import Signin from './signin.tsx';
import Signout from './signout.tsx';
import Study from './study.tsx';
import Setting from './setting.tsx';
import Tasks from './tasks.tsx';
import Issue from './issue.tsx';
import Dict from './dict.tsx';
import DictM from './dictm.tsx';
import Waiting from './waiting.tsx';
import Menu from './menu.tsx';
import RButton from './button-ripple.tsx';

export default () => {
    if (!IS_BROWSER) return <div/>;
    signals.user = useSignal<string>(getUser());
    signals.admin = useComputed(()=>signals.user.value == 'c292YXIuaGVAZ21haWwuY29t');
    signals.setting = useSignal<ISetting>(getSetting());
    signals.dialogs = useSignal<Array<IDialog>>([]);
    signals.stats  = useSignal(getStats());
    signals.studies = useSignal<Array<IStudy>>([]);
    signals.tips = useSignal('');

    const dialog = ({dial, ...rest}: IDialog) => { switch (dial) {
        case "wait": return <Waiting {...rest}/>;
        case 'start': return <Start {...rest}/>;
        case 'issue': return <Issue {...rest}/>;
        case 'study': return <Study {...rest}/>;
        case 'setting': return <Setting {...rest}/>;
        case 'login': return <Signin {...rest}/>;
        case 'logout': return <Signout {...rest}/>;
        case 'about': return <About {...rest}/>;
        case 'help': return <Help {...rest}/>;
        case 'dict': return <Dict {...rest}/>;
        case 'dictm': return <DictM {...rest}/>;
        case 'tasks': return <Tasks {...rest}/>;
        case 'menu': return <Menu {...rest}/>;
    } };
    useEffect(() => (init().catch(console.error), close), []);
    return <>
        <div class="fixed top-0 inset-x-0 bg-slate-200 dark:bg-slate-800 flex flex-col" style={`bottom:${signals.user.value?'60px':'0'}`}>{signals.user.value && <Stats/>}</div>
        {signals.user.value && <div class="fixed inset-x-0 bottom-0 px-4 pb-2 bg-slate-300 dark:bg-slate-700 fill-slate-800 dark:fill-slate-300 flex gap-3 justify-between">
            <RButton class="text-orange-500 fill-orange-500 grow"><svg class="w-9 h-9 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M122.105 52.674c1.045 1.154 1.895.764 1.895-.864V9.66c0-3.017-2.627-5.66-5.353-5.66H80.564c-1.48 0-1.834.935-.786 2.088l13.546 14.917-5.525 6.053-25.625 28.224L48.621 40.37c-1.049-1.153-2.743-1.15-3.791 0L7.14 81.874c-4.188 4.61-4.186 12.082.002 16.69l.263.292c4.187 4.607 10.977 4.607 15.162-.003l24.156-26.595 13.554 14.899c1.048 1.15 2.745 1.15 3.793 0l44.68-49.172zM20.497 113.257l-3.613 3.982c-1.046 1.153-1.893 3.133-1.893 4.425V124h12.49v-15.49c0-1.628-.848-2.014-1.896-.861zm30.467-24.194c-1.048-1.15-1.898-.764-1.898.864v34.07h11.19v-21.784c0-1.629-.805-3.832-1.8-4.92l-1.798-1.971zm16.711 6.256s-.499.552-1.115 1.23c-.614.679-1.112 2.552-1.112 4.18v23.268h11.19v-35.58c0-1.629-.85-2.018-1.899-.865zm32.432-35.71c-1.048 1.15-1.898 3.404-1.898 5.032v59.355h10.404V53.214c0-1.628-.85-2.017-1.898-.864zm-16.38 18.05c-1.045 1.153-1.895 3.407-1.895 5.038V124h11.19V70.37c0-1.628-.848-2.015-1.896-.862zM34.58 97.753c-1.048 1.153-1.895 3.406-1.895 5.035v21.208h11.19v-33.52c0-1.629-.848-2.018-1.896-.865z"/></svg>进度</RButton>
            <RButton class="grow" onClick={()=>showDialog({dial:'dict'})}><svg class="w-9 h-9 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M18.938 93.37c.121-26.895.24-53.753.355-80.572.01-1.78 1.007-3.302 2.379-3.635 7.656-2.032 19.724-1.521 27.918 2.485 5.77 2.655 10.828 7.348 14.583 13.53 3.875-5.886 8.908-10.355 14.584-12.949 7.738-3.763 19.477-4.668 27.89-3.066 1.436.248 2.51 1.801 2.525 3.647v80.898c-.005 2.063-1.325 3.729-2.944 3.716a2.521 2.521 0 01-.675-.105c-7.184-1.187-14.486-.318-21.373 2.544-5.088 2.416-9.918 5.639-14.374 9.592 6.267-2.478 12.798-3.692 19.36-3.6 8.418.17 16.797 1.526 24.982 4.041v-84.66h2.926c1.616 0 2.926 1.669 2.926 3.728v85.81c0 2.059-1.31 3.728-2.926 3.728a2.357 2.357 0 01-.911-.198c-8.818-3.089-17.9-4.778-27.043-5.028-8.08-.13-16.087 1.953-23.48 6.109-1.011.82-2.305.82-3.317 0-7.392-4.157-15.4-6.24-23.48-6.109-9.121.265-18.182 1.961-26.978 5.052a2.343 2.343 0 01-.912.197c-1.634.02-2.963-1.67-2.953-3.75V28.963c0-2.059 1.31-3.728 2.926-3.728h2.926v84.66c8.185-2.515 16.564-3.87 24.983-4.04 7.033-.107 14.03 1.295 20.699 4.145-4.212-4.341-9.013-7.663-14.164-9.802-6.38-2.67-16.115-3.565-23.233-2.787-1.625.202-3.065-1.33-3.2-3.402a7.394 7.394 0 010-.64zm84.364-77.239c-6.763-.813-16.46.14-22.54 3.078-5.652 2.524-10.497 7.342-13.79 13.715v69.981c4.736-4.136 9.854-7.514 15.239-10.057 6.806-2.777 13.96-3.908 21.091-3.333zM61.12 102.185V32.82c-3.063-6.886-8.012-11.485-13.608-14.214-6.38-3.101-16.179-3.798-22.386-2.671l-.328 73.814c6.772-.314 16.124.79 22.35 3.379 5.001 2.066 9.716 5.123 13.972 9.058z"/><path d="M48.602 50.572c-1.248 3.52-3.008 6.432-5.216 8.864-2.464-2.528-4.384-5.504-5.76-8.864zm9.184 0V46.86h-13.92l2.752-.864c-.384-1.312-1.344-3.36-2.176-4.832l-4.064 1.184c.736 1.408 1.44 3.2 1.792 4.512H28.666v3.712h5.024c1.728 4.512 3.936 8.352 6.816 11.52-3.328 2.592-7.456 4.416-12.448 5.664.768.864 1.888 2.656 2.304 3.552 5.152-1.472 9.44-3.584 12.96-6.464 3.36 2.816 7.488 4.928 12.512 6.272.576-1.056 1.696-2.72 2.56-3.552-4.768-1.12-8.8-2.976-12.096-5.536 2.784-3.104 4.96-6.848 6.592-11.456zM81.702 58.432l.743-2.737c.743-2.601 1.486-5.439 2.128-8.175h.135c.744 2.702 1.42 5.574 2.196 8.175l.743 2.737zm8.783 10.304h5.237l-8.04-25h-5.88l-8.006 25h5.068l1.756-6.42h8.109z"/></svg>词典</RButton>
            <RButton class="grow" onClick={()=>startStudy()}><svg class="w-9 h-9 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" stroke-width="4"><path d="M63.99 45.64c11.482 0 20.83-9.347 20.83-20.83C84.82 13.328 75.473 4 63.99 4c-11.482 0-20.83 9.347-20.83 20.83 0 11.483 9.347 20.81 20.83 20.81zm0-34.98c7.826 0 14.17 6.364 14.17 14.17C78.16 32.638 71.796 39 63.99 39c-7.807 0-14.17-6.362-14.17-14.168 0-7.807 6.345-14.171 14.17-14.171z"/><path d="M113.97 72.637h-2.548l1.205-16.7c.099-1.244-.514-2.43-1.6-3.103-13.875-8.418-32.077-7.371-47.056 2.49-14.96-9.842-33.183-10.889-47.057-2.49-1.068.633-1.68 1.838-1.6 3.104l1.204 16.7h-2.51c-3.675 0-6.66 3.003-6.66 6.658v10.396c0 3.675 3.004 6.66 6.66 6.66h4.23c.593 8.182 1.187 16.324 1.78 24.507.158 2.49 3.359 4.367 5.671 2.133 10.375-10.316 25.475-13.339 36.74-7.331 1.225.494 2.253.435 3.143 0 11.264-6.028 26.383-3.004 36.739 7.331 2.292 2.373 5.692.1 5.672-2.133.573-8.183 1.186-16.325 1.779-24.507h4.23c3.675 0 6.66-3.004 6.66-6.66V79.296c-.021-3.656-2.985-6.66-6.681-6.66zM23.93 85.503a4.226 4.226 0 01-4.21 4.21H14.01V79.318h5.73a4.226 4.226 0 014.21 4.209v1.976zm36.72 22.173c-11.107-3.714-24.071-1.363-34.467 6.167-.454-6.205-.89-12.43-1.344-18.637v-.118c3.419-1.818 5.77-5.435 5.77-9.585v-1.977c0-4.743-3.063-8.795-7.331-10.256l-1.127-15.693c11.522-6.027 26.265-4.684 38.499 3.539zm41.147 6.167c-10.396-7.529-23.36-9.88-34.467-6.166V87.835h6.56a3.336 3.336 0 003.341-3.34 3.323 3.323 0 00-3.34-3.34H67.33v-6.027h14.624a3.336 3.336 0 003.34-3.34 3.336 3.336 0 00-3.34-3.34H67.349v-7.37c12.254-8.222 26.997-9.566 38.5-3.519l-1.128 15.693c-4.249 1.461-7.332 5.513-7.332 10.256v1.977c0 4.15 2.332 7.746 5.77 9.585 0 .02-.929 12.727-1.362 18.774zm6.442-24.15a4.226 4.226 0 01-4.21-4.21v-1.976a4.226 4.226 0 014.21-4.21h5.732v10.396z"/></svg>学习</RButton>
            <RButton class="stroke-slate-800 dark:stroke-slate-300 grow" onClick={()=>showDialog({dial:'menu'})}><svg class="w-9 h-9 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" stroke-width="4" fill="none"><circle cx="32" cy="20" r="15"/><path d="M3 57a28 28 0 0158 0z"/></svg>我</RButton>
        </div>}
        {signals.dialogs.value.map(dialog)}
        {signals.tips.value && <div class="fixed top-0 inset-x-0 h-[38px] bg-yellow-300 text-slate-800 flex justify-center items-center" onClick={hideTips}>{signals.tips.value}</div>}
    </>;
}