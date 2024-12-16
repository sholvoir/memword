import { useEffect, useRef } from "preact/hooks";
import { useComputed, useSignal } from "@preact/signals";
import { wait } from "@sholvoir/generic/wait";
import { closeDialog, hideTips, showTips, signals } from "../lib/signals.ts";
import { submitIssue, syncTasks, updateDict, study, totalStats, setStats  } from '../lib/mem.ts';
import { IItem } from "../lib/iitem.ts";
import { DICT_API } from "../lib/common.ts";
import SButton from '@sholvoir/components/islands/button-base.tsx';
import IconAlertCircleFilled from "@preact-icons/tb/TbAlertCircleFilled";
import IconPlayerPlayFilled from "@preact-icons/tb/TbPlayerPlayFilled";
import IconCircleLetterF from "@preact-icons/tb/TbCircleLetterF";
import IconRefresh from "@preact-icons/tb/TbRefresh";
import IconCheck from "@preact-icons/tb/TbCheck";
import IconX from "@preact-icons/tb/TbX";
import Dialog from './dialog.tsx';

const audioUrl = (sound?: string) => {
    if (!sound) return undefined;
    if (sound.startsWith("data")) return sound;
    if (sound.startsWith("http")) return `${DICT_API}/pub/sound?q=${encodeURIComponent(sound)}`;
}

export default () => {
    const index = useSignal(0);
    const curr = useComputed(() => signals.items.value[index.value]);
    const startY = useSignal(0);
    const endY = useSignal(0);
    const finish = async () => {
        closeDialog();
        syncTasks();
        const res = await totalStats();
        if (res.ok) setStats(signals.stats.value = await res.json());
    }
    if (!curr.value) return (finish(), <div/>);
    const player = useRef<HTMLAudioElement>(null);
    const handleRefresh = async () => {
        showTips("Get Server Data...");
        const res = await updateDict(curr.value.word);
        hideTips();
        if (!res.ok) return showTips(`Not Found ${curr.value.word}`);
        signals.items.value[index.value] = await res.json() as IItem;
        signals.items.value = [...signals.items.value];
    };
    const handleIKnown = (level?: number) => {
        if (level !== undefined) curr.value.level = level;
        study(curr.value);
        signals.isPhaseAnswer.value = false;
        if (++index.value >= signals.items.value.length) return finish();
    };
    const handleSpeakIt = () => curr.value?.sound && player.current?.play();
    const handleShowAnswer = () => (signals.isPhaseAnswer.value = true) && handleSpeakIt();
    const handleKeyPress = (event: KeyboardEvent ) => {
        if (signals.dialogs.value.slice(-1)[0]?.dial == 'study') switch (event.key) {
            case 'B': case 'C': case 'b': case 'c': handleSpeakIt(); break;
            case ' ': if (!signals.isPhaseAnswer.value) handleShowAnswer(); break;
            case 'N': case 'X': case 'n': case 'x': if (signals.isPhaseAnswer.value) handleIKnown(); break;
            case 'M': case 'Z': case 'm': case 'z': if (signals.isPhaseAnswer.value) handleIKnown(0); break;
        }
    };
    const handleReportIssue = async () => {
        showTips('Submiting...', false);
        const resp = await submitIssue(curr.value.word);
        if (!resp.ok) showTips(await resp.text());
        else showTips('Submit Success!');
    };
    const continueMove = async (y: number) => {
        endY.value += y;
        const diff = Math.abs(endY.value - startY.value);
        if (diff > globalThis.innerHeight) {
            await wait(10);
            endY.value = startY.value = 0;
        } else {
            await wait(30);
            await continueMove(y);
        };
    };
    const handleTouchStart = (e: TouchEvent) => (e.preventDefault(), endY.value = startY.value = e.touches[0].clientY);
    const handleTouchMove = (e: TouchEvent) => (e.preventDefault(), endY.value = e.touches[0].clientY);
    const handleTouchCancel = (e: TouchEvent) => (e.preventDefault(), endY.value = startY.value = 0);
    const handleTouchEnd = async (e: TouchEvent) => {
        e.preventDefault();
        if (signals.isPhaseAnswer.value) {
            const diff = endY.value - startY.value;
            const max = globalThis.innerHeight;
            if (diff >= max / 6) (await continueMove(60), handleIKnown(0));
            else if (diff <= -max / 6) (await continueMove(-60), handleIKnown());
            else {
                endY.value = startY.value = 0;
                if (Math.abs(diff) < 5) handleSpeakIt();
            }
        } else {
            endY.value = startY.value = 0;
            handleShowAnswer();
        }
    };
    const handleClick = () => signals.isPhaseAnswer.value ? handleSpeakIt() : handleShowAnswer();
    const splite = (w: string) => {
        const [word, n] = w.split('_');
        return <div class="text-4xl font-bold">{word}<sup class="text-lg">{n}</sup></div>;
    }
    useEffect(() => {
        document.addEventListener('keyup', handleKeyPress);
        return () => document.removeEventListener('keyup', handleKeyPress);
    }, []);
    return <Dialog title="学习" onCancel={finish}>
        <div class={`relative h-full [outline:none]`} tabIndex={-1} style={`top: ${endY.value - startY.value}px`}>
            <div class="h-full bg-cover bg-center" style={(signals.isPhaseAnswer.value && curr.value?.pic) ? `background-image: url(${curr.value.pic});` : ''}>
                <div class="h-full study-translucent flex flex-col">
                    <div class="shrink-0 p-2 flex gap-2 text-lg">
                        <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown()} title="X/N">
                            <IconCheck class="bg-round-6"/>
                        </SButton>
                        <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(0)} title="Z/M">
                            <IconX class="bg-round-6"/>
                        </SButton>
                        <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleSpeakIt}>
                            <IconPlayerPlayFilled class="bg-round-6"/>
                        </SButton>
                        <div class="grow text-center">{index.value+1}/{signals.items.value.length}</div>
                        <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(13)}>
                            <IconCircleLetterF class="bg-round-6"/>
                        </SButton>
                        <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleReportIssue}>
                            <IconAlertCircleFilled class="bg-round-6"/>
                        </SButton>
                        <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleRefresh}>
                            <IconRefresh class="bg-round-6"/>
                        </SButton>
                        <div>{curr.value.level}</div>
                    </div>
                    <div class="grow px-2 h-full" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClick={handleClick}>
                        <div class="pb-2 flex gap-2 flex-wrap justify-between">
                            {splite(curr.value.word)}
                            {signals.isPhaseAnswer.value && <div class="text-2xl flex items-center">{curr.value.phonetic}</div>}
                        </div>
                        {signals.isPhaseAnswer.value && <div>
                            {curr.value.trans?.split('\n').map((t: string) => <p class="text-2xl">{t}</p>)}
                            {curr.value.def?.split('\n').map((t: string) => t.startsWith(' ')?<p class="text-lg">&ensp;&bull;{t}</p>:<p class="text-xl font-bold">{t}</p>)}
                        </div>}
                    </div>
                </div>
            </div>
        </div>
        <audio ref={player} src={audioUrl(curr.value?.sound)}/>
    </Dialog>;
}