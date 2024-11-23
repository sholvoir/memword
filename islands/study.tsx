import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { updateStats, submitIssue, syncTasks, deleteTask, getDict, study  } from '../lib/mem.ts';
import { IDiction } from "../lib/idict.ts";
import { ITask } from "../lib/itask.ts";
import Dialog from './dialog.tsx';
import SButton from '@sholvoir/components/islands/button-base.tsx';
import IconAlertCircleFilled from "@preact-icons/tb/TbAlertCircleFilled";
import IconPlayerPlayFilled from "@preact-icons/tb/TbPlayerPlayFilled";
import IconCircleLetterF from "@preact-icons/tb/TbCircleLetterF";
import IconRefresh from "@preact-icons/tb/TbRefresh";
import IconCheck from "@preact-icons/tb/TbCheck";
import IconCut from "@preact-icons/tb/TbCut";
import IconX from "@preact-icons/tb/TbX";
import { closeDialog, showTips, signals } from "../lib/signals.ts";

const spliteNum = /^([A-Za-zèé /&''.-]+)(\d*)/;
let startY = 0;
let endY = 0;

export default () => {
    const index = useSignal(0);
    const current = useSignal<ITask>(signals.tasks.value[0]);
    const dict = useSignal<IDiction | undefined>(undefined);
    const finish = () => {
        closeDialog();
        signals.stats.value = { ...signals.stats.value };
        updateStats();
        syncTasks();
    }
    if (!current.value) return (finish(), <div/>);
    const player = useRef<HTMLAudioElement>(null);
    const getDiction = async () => {
        const res = await getDict(current.value.word);
        if (!res.ok) showTips(`Not Found ${current.value.word}`);
        else dict.value = await res.json();
    }
    const handleRefresh = async () => {
        showTips("Get Server Data...");
        const res = await getDict(current.value.word, true);
        if (res.ok) dict.value = await res.json();
        else showTips(`Not Found ${current.value.word}`);
    };
    const handleIKnown = (level?: number) => {
        if (level !== undefined) current.value.level = level;
        study(current.value);
        signals.isPhaseAnswer.value = false;
        dict.value = undefined;
        if (++index.value >= signals.tasks.value.length) return finish();
        current.value = signals.tasks.value[index.value];
        getDiction();
    };
    const handleSpeakIt = () => dict.value?.sound && player.current?.play();
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
        const resp = await submitIssue(current.value.word);
        if (!resp.ok) showTips(await resp.text());
        else showTips('Submit Success!');
    };
    const handleDeleteTask = () => {
        deleteTask(current.value);
        signals.tasks.value = [...signals.tasks.value.slice(0, index.value), ...signals.tasks.value.slice(index.value+1)];
        current.value = signals.tasks.value[index.value];
        signals.isPhaseAnswer.value = false;
        dict.value = undefined;
        getDiction();
    };
    const moveDivThenRun = (div: HTMLDivElement, y: number, handle: () => void) => {
        endY += y;
        if (endY - startY > div.clientHeight || endY - startY < -div.clientHeight) {
            handle();
            setTimeout(() => {div.style.top = '0'}, 10)
        } else {
            div.style.top = `${endY - startY}px`;
            setTimeout(moveDivThenRun, 20, div, y, handle);
        }
    };
    const handleTouchStart = (e: TouchEvent) => endY = startY = e.touches[0].clientY;
    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (signals.isPhaseAnswer.value)
            (e.currentTarget as HTMLDivElement).style.top = `${(endY = e.touches[0].clientY) - startY}px`;
    };
    const handleTouchEnd = (e: Event) => {
        const div = e.currentTarget as HTMLDivElement;
        if (Math.abs(endY - startY) < 5) {
            div.style.top = '0';
            handleClick();
        } else if (signals.isPhaseAnswer.value) {
            if (endY - startY >= div.clientHeight / 6) moveDivThenRun(div, 60, () => handleIKnown(0));
            else if (endY - startY <= -div.clientHeight / 6) moveDivThenRun(div, -60, handleIKnown);
            else div.style.top = '0';
        }
    };
    const handleTouchCancel = (e: TouchEvent) => (e.currentTarget as HTMLDivElement).style.top = '0';
    const handleClick = () => signals.isPhaseAnswer.value ? handleSpeakIt() : handleShowAnswer();
    const splite = (w: string) => {
        const x = spliteNum.exec(w);
        if (!x) return <div/>;
        const [_, l, n] = x;
        return <div class="text-4xl font-bold">{l}<sup class="text-lg">{n}</sup></div>;
    }
    useEffect(() => {
        document.addEventListener('keyup', handleKeyPress);
        getDiction();
        return () => document.removeEventListener('keyup', handleKeyPress);
    }, []);
    return <Dialog title="学习" onCancel={finish}>
        <div class={`relative h-full bg-cover bg-center [outline:none]`}
            tabIndex={-1} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel}
            style={(signals.isPhaseAnswer.value && dict.value?.pic) ? `background-image: url(${dict.value.pic});` : ''}>
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
                    <div class="grow text-center">{index.value+1}/{signals.tasks.value.length}</div>
                    <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(13)}>
                        <IconCircleLetterF class="bg-round-6"/>
                    </SButton>
                    <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleDeleteTask}>
                        <IconCut class="bg-round-6"/>
                    </SButton>
                    <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleReportIssue}>
                        <IconAlertCircleFilled class="bg-round-6"/>
                    </SButton>
                    <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleRefresh}>
                        <IconRefresh class="bg-round-6"/>
                    </SButton>
                    <div>{current.value.level}</div>
                </div>
                <div class="grow px-2 h-full" onClick={handleClick}>
                    <div class="pb-2 flex gap-2 flex-wrap justify-between">
                        {splite(current.value.word)}
                        {signals.isPhaseAnswer.value && <div class="text-2xl flex items-center">{dict.value?.phonetic}</div>}
                    </div>
                    {signals.isPhaseAnswer.value && <div>
                        {dict.value?.trans?.split('\n').map((t: string) => <p class="text-2xl">{t}</p>)}
                        {dict.value?.def?.split('\n').map((t: string) => t.startsWith(' ')?<p class="text-lg">&ensp;&bull;{t}</p>:<p class="text-xl font-bold">{t}</p>)}
                    </div>}
                </div>
            </div>
        </div>
        <audio ref={player} src={dict.value?.sound}/>
    </Dialog>;
}