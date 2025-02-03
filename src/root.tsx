// deno-lint-ignore-file
import { useSignal } from "@preact/signals-react";
import { useEffect } from "react";
import { IItem } from "../lib/iitem.ts";
import { getUser } from "../lib/mem.ts";
import { signals, init, hideTips, TDial } from "../lib/signals.ts";
import Home from "./home.tsx";
import Add from './add.tsx';
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
    signals.stats  = useSignal([]);
    signals.user = useSignal(getUser());
    signals.dialogs = useSignal<Array<TDial>>([signals.user?'home':'about']);
    signals.tips = useSignal('');
    signals.vocabulary = useSignal([]);
    //
    signals.isPhaseAnswer = useSignal(false);
    signals.item = useSignal<IItem>();
    signals.wlid = useSignal('');
    signals.blevel = useSignal(5);
    signals.sprint = useSignal(0);

    const dialog = (dial: TDial) => { switch (dial) {
        case 'home': return <Home/>
        case "wait": return <Waiting/>;
        case 'add': return <Add/>;
        case 'issue': return <Issue/>;
        case 'study': return <Study/>;
        case 'setting': return <Setting/>;
        case 'login': return <Signin/>;
        case 'logout': return <Signout/>;
        case 'about': return <About/>;
        case 'help': return <Help/>;
        case 'dict': return <Dict/>;
        case 'menu': return <Menu/>;
    } };
    useEffect(() => {init()}, []);
    return <div className="h-[100dvh]">
        {signals.dialogs.value.map(dialog)}
        {signals.tips.value && <div className="tip" onClick={hideTips}>{signals.tips.value}</div>}
    </div>;
}