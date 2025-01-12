import { useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { wait } from "@sholvoir/generic/wait";
import { closeDialog, hideTips, showTips, signals, totalStats } from "../lib/signals.ts";
import { IItem } from "../lib/iitem.ts";
import * as mem from '../lib/mem.ts';
import SButton from '@sholvoir/components/islands/button-base.tsx';
import IconAlertCircleFilled from "@preact-icons/tb/TbAlertCircleFilled";
import IconPlayerPlayFilled from "@preact-icons/tb/TbPlayerPlayFilled";
import IconCircleLetterF from "@preact-icons/tb/TbCircleLetterF";
import IconRefresh from "@preact-icons/tb/TbRefresh";
import IconCheck from "@preact-icons/tb/TbCheck";
import IconX from "@preact-icons/tb/TbX";
import Dialog from './dialog.tsx';

export default () => {
    const finish = () => {
        closeDialog();
        mem.syncTasks();
        totalStats();
    }
    if (!signals.item.value) return (closeDialog(), <div/>);
    const startY = useSignal(0);
    const endY = useSignal(0);
    const player = useRef<HTMLAudioElement>(null);
    const studyNext = async () => {
        if (++signals.sprint.value <= 0) return finish();
        const res = await mem.getEpisode(signals.tag.value, signals.blevel.value);
        if (!res.ok) return (showTips('Network Error!'), finish());
        const item = (await res.json()).item;
        if (!item) return finish();
        signals.item.value = item;
        signals.isPhaseAnswer.value = false;
    };
    const continueMove = async (y: number, max: number) => {
        endY.value += y;
        const diff = Math.abs(endY.value - startY.value);
        if (diff < max) {
            await wait(30);
            await continueMove(y, max);
        };
    };
    const handleRefresh = async () => {
        showTips("Get Server Data...");
        const res = await mem.updateDict(signals.item.value!.word);
        hideTips();
        if (!res.ok) return showTips(`Not Found ${signals.item.value!.word}`);
        signals.item.value = await res.json() as IItem;
    };
    const handleIKnown = async (level?: number) => await mem.studied(signals.item.value!.word, level ?? signals.item.value!.level);
    const handleSpeakIt = () => signals.item.value!.sound && player.current?.play();
    const handleShowAnswer = () => (signals.isPhaseAnswer.value = true) && handleSpeakIt();
    const handleReportIssue = async () => {
        showTips('Submiting...', false);
        const resp = await mem.submitIssue(signals.item.value!.word);
        if (!resp.ok) showTips(await resp.text());
        else showTips('Submit Success!');
    };
    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.ctrlKey || event.altKey) return;
        if (signals.dialogs.value.slice(-1)[0] == 'study') switch (event.key) {
            case ' ': handleClick(); break;
            case 'N': case 'X': case 'n': case 'x': if (signals.isPhaseAnswer.value) handleIKnown().then(studyNext); break;
            case 'M': case 'Z': case 'm': case 'z': if (signals.isPhaseAnswer.value) handleIKnown(0).then(studyNext); break;
        }
    };
    const handleTouchStart = (e: TouchEvent) => signals.isPhaseAnswer.value && (endY.value = startY.value = e.touches[0].clientY);
    const handleTouchMove = (e: TouchEvent) => signals.isPhaseAnswer.value && (endY.value = e.touches[0].clientY);
    const handleTouchCancel = () => signals.isPhaseAnswer.value && (endY.value = startY.value = 0);
    const handleTouchEnd = async (e: TouchEvent) => {
        if (signals.isPhaseAnswer.value) {
            const h = (e.currentTarget as HTMLDivElement).scrollHeight + 60;
            const diff = endY.value - startY.value;
            const max = Math.max(globalThis.innerHeight, h);
            if (Math.abs(diff) >= globalThis.innerHeight / 6) {
                if (diff > 0) {
                    await handleIKnown(0);
                    await continueMove(60, max);
                } else {
                    await handleIKnown();
                    await continueMove(-60, max)
                }
                await studyNext();
                endY.value = startY.value = 0;
            } else {
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
    return <Dialog title="学习" onCancel={finish}>
        <div class={`relative h-full flex flex-col [outline:none]`} tabIndex={-1} onKeyUp={handleKeyPress}
            style={`top: ${endY.value - startY.value}px`}>
            <div class="p-2 flex gap-2 text-lg">
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown().then(studyNext)} title="X/N">
                    <IconCheck class="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(0).then(studyNext)} title="Z/M">
                    <IconX class="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleSpeakIt}>
                    <IconPlayerPlayFilled class="bg-round-6"/>
                </SButton>
                <div class="grow text-center">{signals.sprint.value > 0 ? signals.sprint.value : ''}</div>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(13).then(studyNext)}>
                    <IconCircleLetterF class="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleReportIssue}>
                    <IconAlertCircleFilled class="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleRefresh}>
                    <IconRefresh class="bg-round-6"/>
                </SButton>
                <div>{signals.item.value.level}</div>
            </div>
            <div class="grow px-2 flex flex-col" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClick={handleClick}>
                <div class="pb-2 flex gap-2 flex-wrap justify-between">
                    {splite(signals.item.value.word)}
                    {signals.isPhaseAnswer.value && <div class="text-2xl flex items-center">{signals.item.value.phonetic}</div>}
                </div>
                {signals.isPhaseAnswer.value && <div class="grow h-0 overflow-y-auto [scrollbar-width:none]">
                    {signals.item.value.trans?.split('\n').map((t: string) => <p class="text-2xl">{t}</p>)}
                    {signals.item.value.def?.split('\n').map((t: string) => t.startsWith(' ')?<p class="text-lg">&ensp;&bull;{t}</p>:<p class="text-xl font-bold">{t}</p>)}
                </div>}
            </div>
        </div>
        <audio ref={player} src={signals.item.value?.sound}/>
    </Dialog>;
}