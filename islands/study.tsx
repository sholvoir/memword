import { useEffect, useRef } from "preact/hooks";
import { useSignal, useComputed } from "@preact/signals";
import { signals, closeDialog, updateStats, syncTasks, study, getDiction, submitIssue, showTips, removeTask, showDialog } from '../lib/mem.ts';
import IconCut from "tabler_icons/cut.tsx";
import IconRefresh from "tabler_icons/refresh.tsx";
import IconAlertCircleFilled from "tabler_icons/alert-circle-filled.tsx";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";
import IconCircleLetterF from "tabler_icons/circle-letter-f.tsx";
import IconBook2 from "tabler_icons/book-2.tsx";
import SButton from './button-anti-shake.tsx';
import Dialog from './dialog.tsx';

let startY = 0;
let endY = 0;

export default () => {
    const index = useSignal(0);
    const current = useSignal(signals.studies.value[index.value]);
    const finish = async () => {
        closeDialog();
        signals.stats.value = { ...signals.stats.value };
        signals.syncDone.value = false;
        await updateStats();
        await syncTasks();
        signals.syncDone.value = true;
    }
    if (!current.value) return (finish(), <div/>);
    const shouldSound = useComputed(() => signals.isPhaseAnswer.value || current.value.type == 'L');
    const shouldSpell = useComputed(() => signals.isPhaseAnswer.value || current.value.type == 'R');
    const player = useRef<HTMLAudioElement>(null);
    const handleIKnown = async () => {
        await study(current.value, signals.stats.value);
        signals.isPhaseAnswer.value = false;
        if (index.value >= signals.studies.value.length) return finish();
        current.value = signals.studies.value[++index.value];
    };
    const handleKeyPress = (event: KeyboardEvent ) => {
        if (signals.dialogs.value.slice(-1)[0]?.dial == 'study') switch (event.key) {
            case 'B': case 'C': case 'b': case 'c': handleSpeakIt(); break;
            case ' ': if (!signals.isPhaseAnswer.value) handleShowAnswer(); break;
            case 'N': case 'X': case 'n': case 'x': if (signals.isPhaseAnswer.value) handleIKnown(); break;
            case 'M': case 'Z': case 'm': case 'z': if (signals.isPhaseAnswer.value) handleDontKnow(); break;
        }
    };
    const handleSpeakIt = () => current.value.sound && shouldSound.value && player.current?.play();
    const handleShowAnswer = () => signals.isPhaseAnswer.value || (signals.isPhaseAnswer.value = true);
    const handleFinished = () => (current.value.level = 14, handleIKnown());
    const handleDontKnow = () => (current.value.level = 0, handleIKnown());
    const handleDictMaintain = () => showDialog({dial: 'dictm', study: current});
    const handleRefresh = async () => current.value = { ...current.value, ...await getDiction(current.value.word, true) };
    const handleReportIssue = async () => {
        const resp = await submitIssue(current.value.word);
        if (!resp.ok) showTips(await resp.text());
        else showTips('Submit Success!');
    };
    const handleDeleteTask = async () => {
        await removeTask(current.value.type, current.value.word);
        signals.studies.value = [...signals.studies.value.slice(0, index.value), ...signals.studies.value.slice(index.value+1)];
        current.value = signals.studies.value[index.value];
        signals.isPhaseAnswer.value = false;
    };
    const handleTouchStart = (e: TouchEvent) => endY = startY = e.touches[0].clientY;
    const handleTouchMove = (e: TouchEvent) => signals.isPhaseAnswer.value && ((e.currentTarget as HTMLDivElement).style.top = `${(endY = e.touches[0].clientY) - startY}px`);
    const moveDivThenRun = (div: HTMLDivElement, y: number, handle: () => void) => {
        endY += y;
        if (endY - startY > div.clientHeight || endY - startY < -div.clientHeight) (handle(), setTimeout(() => {div.style.top = '0'}, 10));
        else (div.style.top = `${endY - startY}px`, setTimeout(moveDivThenRun, 20, div, y, handle));
    }
    const handleTouchEnd = (e: Event) => {
        const div = e.currentTarget as HTMLDivElement;
        if (Math.abs(endY - startY) < 1) {
            div.style.top = '0';
            const rect = div.getBoundingClientRect();
            if (startY > rect.top + rect.height / 2) handleShowAnswer();
            else if (startY > rect.top + 36) handleSpeakIt();
        } else if (signals.isPhaseAnswer.value) {
            if (endY - startY >= div.clientHeight / 6) moveDivThenRun(div, 60, handleDontKnow);
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
    useEffect(()=>(document.addEventListener('keyup', handleKeyPress), ()=>document.removeEventListener('keyup', handleKeyPress)), []);
    return <Dialog title="学习" onCancel={finish}>
        <div class="relative p-2 h-full flex flex-col bg-cover bg-center text-thick-shadow [outline:none]" tabIndex={-1} onClick={handleClick} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} style={(signals.isPhaseAnswer.value && current.value.pic) ? `background-image: url(${current.value.pic});` : ''}>
            <div class="flex gap-2 text-lg">
                <div>{index.value+1}/{signals.studies.value.length}</div>
                <SButton onClick={handleShowAnswer} title="_" disabled={signals.isPhaseAnswer.value}><span class="bg-round-6">答</span></SButton>
                <SButton onClick={handleIKnown} title="X/N" disabled={!signals.isPhaseAnswer.value}><span class="bg-round-6">知</span></SButton>
                <SButton onClick={handleDontKnow} title="Z/M" disabled={!signals.isPhaseAnswer.value}><span class="bg-round-6">不</span></SButton>
                <div class="grow"/>
                {signals.admin.value && <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleDictMaintain}><IconBook2 class="bg-round-6"/></SButton>}
                <SButton disabled={!shouldSound.value} onClick={handleSpeakIt}><IconPlayerPlayFilled class="bg-round-6"/></SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleFinished}><IconCircleLetterF class="bg-round-6"/></SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleDeleteTask}><IconCut class="bg-round-6"/></SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleReportIssue}><IconAlertCircleFilled class="bg-round-6"/></SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleRefresh}><IconRefresh class="bg-round-6"/></SButton>
                <div>{current.value.level}</div>
            </div>
            {shouldSpell.value && <div class="text-4xl font-bold">{current.value.word}</div>}
            {signals.isPhaseAnswer.value && <div class="text-2xl">{current.value.phonetic}</div>}
            {signals.isPhaseAnswer.value && <div class="grow text-2xl">{current.value.trans?.split('\n').map(t => <p>{t}</p>)}</div>}
        </div>
        <audio ref={player} src={shouldSound.value ? current.value.sound : undefined} autoplay/>
    </Dialog>;
}