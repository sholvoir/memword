import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { signals, closeDialog, showTips } from '../lib/mem.ts';
import { updateStats, submitIssue, syncTasks, deleteTask, getDict } from '../lib/worker.ts'
import { IDict } from "dict/lib/idict.ts";
import { ITask } from "../lib/itask.ts";
import { study } from "../lib/worker.ts";
import Dialog from './dialog.tsx';
import SButton from './button-anti-shake.tsx';
import IconAlertCircleFilled from "tabler_icons/alert-circle-filled.tsx";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";
import IconCircleLetterF from "tabler_icons/circle-letter-f.tsx";
import IconCircleLetterA from "tabler_icons/circle-letter-a.tsx";
import IconRefresh from "tabler_icons/refresh.tsx";
import IconCheck from "tabler_icons/check.tsx";
import IconCut from "tabler_icons/cut.tsx";
import IconX from "tabler_icons/x.tsx";

let startY = 0;
let endY = 0;

export default () => {
    const index = useSignal(0);
    const current = useSignal<ITask>(signals.tasks.value[0]);
    const dict = useSignal<IDict>({});
    const finish = () => {
        closeDialog();
        signals.stats.value = { ...signals.stats.value };
        updateStats();
        syncTasks();
    }
    if (!current.value) return (finish(), <div/>);
    const player = useRef<HTMLAudioElement>(null);
    const getDiction = async () => {
        const d = await getDict(current.value.word);
        if (d) dict.value = d;
        else console.error('Not Found!');
    }
    const handleRefresh = async () => {
        const d = await getDict(current.value.word, true);
        if (d) dict.value = d;
        else console.error('Not Found!');
    };
    const handleIKnown = (level?: number) => {
        if (level !== undefined) current.value.level = level;
        study(current.value);
        signals.isPhaseAnswer.value = false;
        if (++index.value >= signals.tasks.value.length) return finish();
        current.value = signals.tasks.value[index.value];
        getDiction();
    };
    const handleSpeakIt = () => (signals.isPhaseAnswer.value || current.value.type == 'L')
        && dict.value.sound
        && player.current?.play();
    const handleShowAnswer = () => signals.isPhaseAnswer.value || (signals.isPhaseAnswer.value = true);
    const handleKeyPress = (event: KeyboardEvent ) => {
        if (signals.dialogs.value.slice(-1)[0]?.dial == 'study') switch (event.key) {
            case 'B': case 'C': case 'b': case 'c': handleSpeakIt(); break;
            case ' ': if (!signals.isPhaseAnswer.value) handleShowAnswer(); break;
            case 'N': case 'X': case 'n': case 'x': if (signals.isPhaseAnswer.value) handleIKnown(); break;
            case 'M': case 'Z': case 'm': case 'z': if (signals.isPhaseAnswer.value) handleIKnown(0); break;
        }
    };
    const handleReportIssue = async () => {
        const resp = await submitIssue(current.value.word);
        if (!resp.ok) showTips(await resp.text());
        else showTips('Submit Success!');
    };
    const handleDeleteTask = () => {
        deleteTask(current.value);
        signals.tasks.value = [...signals.tasks.value.slice(0, index.value), ...signals.tasks.value.slice(index.value+1)];
        current.value = signals.tasks.value[index.value];
        getDiction();
        signals.isPhaseAnswer.value = false;
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
        if (Math.abs(endY - startY) < 1) {
            div.style.top = '0';
            const rect = div.getBoundingClientRect();
            if (startY < rect.top + 36) return;
            if (!signals.isPhaseAnswer.value && (current.value.type == 'R' || startY > rect.top + rect.height / 2)) handleShowAnswer();
            else handleSpeakIt();
        } else if (signals.isPhaseAnswer.value) {
            if (endY - startY >= div.clientHeight / 6) moveDivThenRun(div, 60, () => handleIKnown(0));
            else if (endY - startY <= -div.clientHeight / 6) moveDivThenRun(div, -60, handleIKnown);
            else div.style.top = '0';
        }
    };
    const handleTouchCancel = (e: TouchEvent) => (e.currentTarget as HTMLDivElement).style.top = '0';
    const handleClick = (e: MouseEvent) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        if (e.clientY > rect.top + rect.height / 2) handleShowAnswer();
        else if (e.clientY > rect.top + 36) handleSpeakIt();
    }
    useEffect(() => {
        document.addEventListener('keyup', handleKeyPress);
        getDiction();
        return () => document.removeEventListener('keyup', handleKeyPress);
    }, []);
    return <Dialog title="学习" onCancel={finish}>
        <div class="relative p-2 h-full flex flex-col bg-cover bg-center text-thick-shadow [outline:none]"
            tabIndex={-1} onClick={handleClick} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel}
            style={(signals.isPhaseAnswer.value && dict.value.pic) ? `background-image: url(${dict.value.pic});` : ''}>
            <div class="flex gap-2 text-lg">
                <SButton disabled={signals.isPhaseAnswer.value} onClick={handleShowAnswer} title="_">
                    <IconCircleLetterA class="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown()} title="X/N">
                    <IconCheck class="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(0)} title="Z/M">
                    <IconX class="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value && current.value.type == 'R'} onClick={handleSpeakIt}>
                    <IconPlayerPlayFilled class="bg-round-6"/>
                </SButton>
                <div class="grow text-center">{index.value+1}/{signals.tasks.value.length}</div>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(14)}>
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
            {(signals.isPhaseAnswer.value || current.value.type == 'R') && <div class="text-4xl font-bold">{current.value.word}</div>}
            {signals.isPhaseAnswer.value && <div class="text-2xl">{dict.value?.phonetic}</div>}
            {signals.isPhaseAnswer.value && <div class="grow text-2xl">{dict.value?.trans?.split('\n').map(t => <p>{t}</p>)}</div>}
        </div>
        <audio ref={player} src={(signals.isPhaseAnswer.value || current.value.type == 'L') ? dict.value?.sound : undefined} autoplay/>
    </Dialog>;
}