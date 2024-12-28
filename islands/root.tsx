// deno-lint-ignore-file
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { ISetting } from "../lib/isetting.ts";
import { IItem } from "../lib/iitem.ts";
import { getUser, getSetting, getStats } from "../lib/mem.ts";
import { signals, init, hideTips, Dial } from "../lib/signals.ts";
import { type Tag } from "@sholvoir/vocabulary";
import { type BLevel } from "../lib/istat.ts";
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
    if (!IS_BROWSER) return <div/>;
    signals.user = useSignal(getUser());
    signals.setting = useSignal<ISetting>(getSetting());
    signals.stats  = useSignal(getStats());
    signals.dialogs = useSignal<Array<Dial>>([signals.user?'home':'about']);
    signals.tips = useSignal('');
    signals.vocabulary = useSignal([]);
    //
    signals.isPhaseAnswer = useSignal(false);
    signals.item = useSignal<IItem>();
    signals.tag = useSignal<Tag>();
    signals.blevel = useSignal<BLevel>();
    signals.sprint = useSignal(0);

    const dialog = (dial: Dial) => { switch (dial) {
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
    return <div class="h-[100dvh]">
        {signals.dialogs.value.map(dialog)}
        {signals.tips.value && <div class="tip" onClick={hideTips}>{signals.tips.value}</div>}
    </div>;
}