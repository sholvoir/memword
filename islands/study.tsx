import { useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { wait } from "@sholvoir/generic/wait";
import { closeDialog, hideTips, showTips, signals } from "../lib/signals.ts";
import * as mem from '../lib/mem.ts';
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
    const finish = async () => {
        closeDialog();
        mem.syncTasks();
        const res = await mem.totalStats();
        if (res.ok) mem.setStats(signals.stats.value = await res.json());
    }
    if (!signals.item.value) return (finish(), <div/>);
    const startY = useSignal(0);
    const endY = useSignal(0);
    const player = useRef<HTMLAudioElement>(null);
    const studyNext = async (level?: number): Promise<IItem|undefined> => {
        await mem.studied(signals.item.value!.word, level ?? signals.item.value!.level);
        if (--signals.remain.value <= 0) return (finish(), undefined);
        const res = await mem.getEpisode(signals.tag.value, signals.blevel.value);
        if (!res.ok) return (showTips('Network Error!'), undefined);
        return await res.json();
    }
    const handleRefresh = async () => {
        showTips("Get Server Data...");
        const res = await mem.updateDict(signals.item.value!.word);
        hideTips();
        if (!res.ok) return showTips(`Not Found ${signals.item.value!.word}`);
        signals.item.value = await res.json() as IItem;
    };
    const handleIKnown = async (level?: number) => {
        const item = await studyNext(level);
        if (item) {
            signals.item.value = item;
            signals.isPhaseAnswer.value = false;
        }
    };
    const handleSpeakIt = () => signals.item.value!.sound && player.current?.play();
    const handleShowAnswer = () => (signals.isPhaseAnswer.value = true) && handleSpeakIt();
    const handleReportIssue = async () => {
        showTips('Submiting...', false);
        const resp = await mem.submitIssue(signals.item.value!.word);
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
            if (Math.abs(diff) >= max / 6) {
                const [item] = diff > 0 ? await Promise.all([studyNext(), continueMove(60)])
                    : await Promise.all([studyNext(0), continueMove(-60)]);
                if (item) {
                    signals.item.value = item;
                    signals.isPhaseAnswer.value = false;
                }
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
        <div class={`relative h-full [outline:none]`} tabIndex={-1} style={`top: ${endY.value - startY.value}px`}>
            <div class="h-full bg-cover bg-center" style={(signals.isPhaseAnswer.value && signals.item.value?.pic) ? `background-image: url(${signals.item.value.pic});` : ''}>
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
                        <div class="grow text-center">{signals.remain.value}</div>
                        <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(13)}>
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
                    <div class="grow px-2 h-full" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClick={handleClick}>
                        <div class="pb-2 flex gap-2 flex-wrap justify-between">
                            {splite(signals.item.value.word)}
                            {signals.isPhaseAnswer.value && <div class="text-2xl flex items-center">{signals.item.value.phonetic}</div>}
                        </div>
                        {signals.isPhaseAnswer.value && <div>
                            {signals.item.value.trans?.split('\n').map((t: string) => <p class="text-2xl">{t}</p>)}
                            {signals.item.value.def?.split('\n').map((t: string) => t.startsWith(' ')?<p class="text-lg">&ensp;&bull;{t}</p>:<p class="text-xl font-bold">{t}</p>)}
                        </div>}
                    </div>
                </div>
            </div>
        </div>
        <audio ref={player} src={audioUrl(signals.item.value?.sound)}/>
    </Dialog>;
}