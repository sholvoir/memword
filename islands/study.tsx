// deno-lint-ignore-file no-explicit-any
import { useRef } from "preact/hooks";
import { useSignal, useComputed } from "@preact/signals";
import { signals, closeDialog, updateStats, syncTasks, study, getDiction, submitIssue, showTips, removeTask, showDialog } from '../lib/mem.ts';
import IconCut from "tabler_icons/cut.tsx";
import IconRefresh from "tabler_icons/refresh.tsx";
import IconAlertCircleFilled from "tabler_icons/alert-circle-filled.tsx";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";
import IconCircleLetterF from "tabler_icons/circle-letter-f.tsx";
import IconChevronsRight from "tabler_icons/chevrons-right.tsx";
import IconChevronsLeft from "tabler_icons/chevrons-left.tsx";
import IconBook2 from "tabler_icons/book-2.tsx";
import SButton from './button-anti-shake.tsx';
import Dialog from './dialog.tsx';

let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

export default () => {
    const index = useSignal(0);
    const current = useSignal(signals.studies.value[index.value]);
    const shouldSound = useComputed(() => signals.isPhaseAnswer.value || current.value.type == 'L');
    const shouldSpell = useComputed(() => signals.isPhaseAnswer.value || current.value.type == 'R');

    const finish = () => {
        closeDialog();
        signals.stats.value = { ...signals.stats.value };
        updateStats();
        syncTasks();
    }
    if (!current.value) return (finish(), <div/>);
    const player = useRef<HTMLAudioElement>(null);
    const handleKeyPress = (event: KeyboardEvent ) => {
        if (event.isComposing) return;
        switch (event.code) {
            case 'Comma': handlePrevious(); break;
            case 'Period': handleNext(); break;
            case 'KeyB': case 'KeyC': handleSpeakIt(); break;
            case 'Space': if (!signals.isPhaseAnswer.value) handleShowAnswer(); break;
            case 'KeyN': case 'KeyX': if (signals.isPhaseAnswer.value) handleIKnown(); break;
            case 'KeyM': case 'KeyZ': if (signals.isPhaseAnswer.value) handleDontKnow(); break;
        }
    };
    const handleSpeakIt = () => {
        if (current.value.sound && shouldSound.value) player.current?.play();
    };
    const handleShowAnswer = () => signals.isPhaseAnswer.value = true;
    const handleIKnown = async () => {
        await study(current.value, signals.stats.value);
        handleNext();
    };
    const handleDictMaintain = () => {
        showDialog({dial: 'dictm', study: current})
    }
    const handleSkilled = async () => {
        current.value.level = 14;
        await handleIKnown();
    }
    const handleDontKnow = () => {
        current.value.level = 0;
        handleIKnown();
    };
    const handleNext = () => {
        signals.isPhaseAnswer.value = false;
        if (index.value >= signals.studies.value.length) return finish();
        current.value = signals.studies.value[++index.value];
    };
    const handlePrevious = () => {
        signals.isPhaseAnswer.value = false;
        if (index.value <= 0) return finish();
        current.value = signals.studies.value[--index.value];
    };
    const handleRefresh = async () => {
        const dict: any = await getDiction(current.value.word, true);
        current.value = { ...current.value, ...dict };
    };
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
    const handleTouchStart = (e: TouchEvent) => {
        endX = startX = e.touches[0].clientX;
        endY = startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
        const div = e.currentTarget as HTMLDivElement;
        endX = e.touches[0].clientX;
        endY = e.touches[0].clientY;
        if (Math.abs(endX - startX) > Math.abs(endY - startY)) {
            div.style.left = `${endX - startX}px`;
            div.style.top = '0';
        } else if (signals.isPhaseAnswer) {
            div.style.left = '0';
            div.style.top = `${endY - startY}px`;
        }
    };
    const handleTouchEnd = (e: Event) => {
        const div = e.currentTarget as HTMLDivElement;
        div.style.top = '0';
        div.style.left = '0';
        if (Math.abs(endX - startX) < 1 && Math.abs(endY - startY) < 1) {
            const rect = div.getBoundingClientRect();
            if (startY > rect.top + rect.height / 2) handleShowAnswer();
            else handleSpeakIt();
        } else if (Math.abs(endX - startX) > Math.abs(endY - startY)) {
            if (endX - startX >= div.clientWidth / 2) handlePrevious();
            if (endX - startX <= -div.clientWidth / 2) handleNext();
        } else if (signals.isPhaseAnswer) {
            if (endY - startY >= div.clientHeight / 2) handleDontKnow();
            if (endY - startY <= -div.clientHeight / 2) handleIKnown();
        }
    };
    const handleTouchCancel = (e: TouchEvent) => {
        const div = e.currentTarget as HTMLDivElement;
        div.style.top = '0';
        div.style.left = '0';
    };
    return <Dialog title="学习" onCancel={finish}>
        <div class="relative p-2 h-full flex flex-col bg-cover bg-center text-thick-shadow [outline:none]" tabIndex={-1} onKeyUp={handleKeyPress} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} style={(signals.isPhaseAnswer.value && current.value.pic) ? `background-image: url(${current.value.pic});` : ''}>
            <div class="flex gap-2 text-lg">
                <SButton disabled={index.value <= 0} onClick={handlePrevious}><IconChevronsLeft class="bg-round-6"/></SButton>
                <div>{index.value+1}/{signals.studies.value.length}</div>
                <SButton disabled={index.value >= signals.studies.value.length} onClick={handleNext}><IconChevronsRight class="bg-round-6"/></SButton>
                <div class="grow"/>
                {signals.admin.value && <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleDictMaintain}><IconBook2 class="bg-round-6"/></SButton>}
                <SButton disabled={!shouldSound.value} onClick={handleSpeakIt}><IconPlayerPlayFilled class="bg-round-6"/></SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleSkilled}><IconCircleLetterF class="bg-round-6"/></SButton>
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