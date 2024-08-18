// deno-lint-ignore-file
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { ISetting } from "../lib/isetting.ts";
import { ITask } from "../lib/itask.ts";
import { signals, getUser, hideTips, init, close, IDialog } from "../lib/mem.ts";
import { getSetting, getStats } from "../lib/worker.ts";
import Home from "./home.tsx";
import Start from './start.tsx';
import About from './about.tsx';
import Help from './help.tsx';
import Signin from './signin.tsx';
import Signout from './signout.tsx';
import Study from './study.tsx';
import Setting from './setting.tsx';
import Issue from './issue.tsx';
import Dict from './dict.tsx';
import Waiting from './waiting.tsx';
import Menu from './menu.tsx';


export default () => {
    if (!IS_BROWSER) return <div/>;
    signals.user = useSignal(getUser());
    signals.setting = useSignal<ISetting>(getSetting());
    signals.dialogs = useSignal<Array<IDialog>>([]);
    signals.stats  = useSignal(getStats());
    signals.tasks = useSignal<Array<ITask>>([]);
    signals.tips = useSignal('');
    signals.isPhaseAnswer = useSignal(false);

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
        case 'menu': return <Menu {...rest}/>;
    } };
    useEffect(() => (init(), close), []);
    return <div class="h-[100dvh]">
        {signals.user.value && <Home/>}
        {signals.dialogs.value.map(dialog)}
        {signals.tips.value && <div class="fixed top-0 inset-x-6 p-2 bg-yellow-300 text-slate-800 flex justify-center items-center" onClick={hideTips}>{signals.tips.value}</div>}
    </div>;
}