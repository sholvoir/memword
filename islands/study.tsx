// deno-lint-ignore-file no-explicit-any
import { useEffect, useRef } from "preact/hooks";
import { useSignal, useComputed } from "@preact/signals";
import { signals, closeDialog, updateStats, syncTasks, study, getDiction, submitIssue, showTips, removeTask, showDialog } from '../lib/mem.ts';
import IconCut from "tabler_icons/cut.tsx";
import IconRefresh from "tabler_icons/refresh.tsx";
import IconAlertCircleFilled from "tabler_icons/alert-circle-filled.tsx";
import IconCircleLetterF from "tabler_icons/circle-letter-f.tsx";
import IconChevronsLeft from "tabler_icons/chevrons-left.tsx";
import IconChevronsRight from "tabler_icons/chevrons-right.tsx";
import IconBook2 from "tabler_icons/book-2.tsx";
import SButton from './button-anti-shake.tsx';
import NButton from './button-normal.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const index = useSignal(0);
    const isPhaseAnswer = useSignal(false);
    const current = useSignal(signals.studies.value[index.value]);
    const shouldSound = useComputed(() => isPhaseAnswer.value || current.value.type == 'L');
    const shouldSpell = useComputed(() => isPhaseAnswer.value || current.value.type == 'R');

    const finish = () => {
        closeDialog();
        signals.stats.value = { ...signals.stats.value };
        updateStats();
        syncTasks();
    }
    if (!current.value) return (finish(), <div/>);
    const player = useRef<HTMLAudioElement>(null);
    const handleKeyPress = (event: any) => {
        switch (event.keyCode) {
            case 44: case 60: handlePrevious(); break;
            case 66: case 98: case 67: case 99: handleSpeakIt(); break;
            case 32: if (!isPhaseAnswer.value) handleShowAnswer(); break;
            case 78: case 88: case 110: case 120: if (isPhaseAnswer.value) handleIKnown(); break;
            case 77: case 90: case 109: case 122: if (isPhaseAnswer.value) handleDontKnow(); break;
            case 46: case 62: handleNext();
        }
    };
    const handleSpeakIt = () => {
        if (current.value.sound && shouldSound.value) player.current?.play();
    };
    const handleShowAnswer = () => isPhaseAnswer.value = true;
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
        if (index.value >= signals.studies.value.length) return finish();
        current.value = signals.studies.value[++index.value];
        isPhaseAnswer.value = false;
    };
    const handlePrevious = () => {
        if (index.value <= 0) return finish();
        current.value = signals.studies.value[--index.value];
        isPhaseAnswer.value = false;
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
        isPhaseAnswer.value = false;
    }
    useEffect(() => {
        addEventListener('keypress', handleKeyPress);
        return () => removeEventListener('keypress', handleKeyPress);
    }, []);
    return <Dialog title="学习" onCancel={finish}>
        <div class="p-2 h-full flex flex-col bg-cover bg-center text_thick-shadow" style={(isPhaseAnswer.value && current.value.pic) ? `background-image: url(${current.value.pic});` : ''}>
            <div class="flex gap-2 text-lg">
                <SButton disabled={index.value <= 0} onClick={handlePrevious}><IconChevronsLeft class="bg-round-6"/></SButton>
                <div>{index.value+1}/{signals.studies.value.length}</div>
                <SButton disabled={index.value >= signals.studies.value.length} onClick={handleNext}><IconChevronsRight class="bg-round-6"/></SButton>
                <div class="grow"/>
                {signals.admin.value && <SButton disabled={!isPhaseAnswer.value} onClick={handleDictMaintain}><IconBook2 class="bg-round-6"/></SButton>}
                <SButton disabled={!isPhaseAnswer.value} onClick={handleSkilled}><IconCircleLetterF class="bg-round-6"/></SButton>
                <SButton disabled={!isPhaseAnswer.value} onClick={handleDeleteTask}><IconCut class="bg-round-6"/></SButton>
                <SButton disabled={!isPhaseAnswer.value} onClick={handleReportIssue}><IconAlertCircleFilled class="bg-round-6"/></SButton>
                <SButton disabled={!isPhaseAnswer.value} onClick={handleRefresh}><IconRefresh class="bg-round-6"/></SButton>
                <div>{current.value.level}</div>
            </div>
            <div class="h-10">
                {shouldSpell.value && <span class="text-4xl font-bold">{current.value.word}</span>}
            </div>
            <div class="grow flex gap-2">
                <div class="grow text-2xl">
                    {isPhaseAnswer.value && <>
                        <div>{current.value.phonetic}</div>
                        <div>{current.value.trans?.split('\n').map(t => <p>{t}</p>)}</div>
                    </>}
                </div>
                <div class="shrink-0 flex flex-col gap-4 text-lg justify-center">
                    <NButton onClick={handleSpeakIt} title="_" disabled={!shouldSound.value}>播放</NButton>
                    <NButton onClick={handleShowAnswer} title="_" disabled={isPhaseAnswer.value}>答案</NButton>
                    <NButton onClick={handleIKnown} title="X/N" disabled={!isPhaseAnswer.value}>知道</NButton>
                    <NButton onClick={handleDontKnow} title="Z/M" disabled={!isPhaseAnswer.value}>不会</NButton>
                </div>
            </div>
            <audio ref={player} src={shouldSound.value ? current.value.sound : undefined} autoplay/>
        </div>
    </Dialog>;
}