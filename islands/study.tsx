// deno-lint-ignore-file no-explicit-any
import { useEffect, useRef } from "preact/hooks";
import { Signal, useSignal, useComputed } from "@preact/signals";
import { IStudy } from "../lib/istudy.ts";
import * as mem from '../lib/mem.ts';
import IconCut from "tabler_icons/cut.tsx";
import IconRefresh from "tabler_icons/refresh.tsx";
import IconAlertCircleFilled from "tabler_icons/alert-circle-filled.tsx";
import IconCircleLetterF from "tabler_icons/circle-letter-f.tsx";
import IconChevronsLeft from "tabler_icons/chevrons-left.tsx";
import IconChevronsRight from "tabler_icons/chevrons-right.tsx";
import SButton from './button-anti-shake.tsx';
import NButton from './button-normal.tsx';
import Dialog from './dialog.tsx';

interface StudyProps {
    studies: Signal<Array<IStudy>>;
    showTips: (content: string) => void;
    onFinish: () => void;
};

export default ({ studies, showTips, onFinish }: StudyProps) => {
    const index = useSignal(0);
    const isPhaseAnswer = useSignal(false);
    const study = useSignal(studies.value[index.value]);
    const shouldSound = useComputed(() => isPhaseAnswer.value || study.value.type == 'L');
    const shouldSpell = useComputed(() => isPhaseAnswer.value || study.value.type == 'R');
    if (!study.value) return (onFinish(), <div/>);
    const player = useRef<HTMLAudioElement>(null);

    const handleKeyPress = (event: any) => {
        event.preventDefault();
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
        if (study.value.sound && shouldSound.value) player.current?.play();
    };
    const handleShowAnswer = () => isPhaseAnswer.value = true;
    const handleIKnown = async () => {
        await mem.study(study.value);
        handleNext();
    };
    const handleSkilled = async () => {
        study.value.level = 14;
        await handleIKnown();
    }
    const handleDontKnow = () => {
        study.value.level = 0;
        handleIKnown();
    };
    const handleNext = () => {
        if (index.value >= studies.value.length) return onFinish();
        study.value = studies.value[++index.value];
        isPhaseAnswer.value = false;
    };
    const handlePrevious = () => {
        if (index.value <= 0) return onFinish();
        study.value = studies.value[--index.value];
        isPhaseAnswer.value = false;
    };
    const handleRefresh = async () => {
        const dict: any = await mem.getFreshDiction(study.value.word);
        study.value = { ...study.value, ...dict };
    };
    const handleReportIssue = async () => {
        const resp = await mem.submitIssue(study.value.word);
        if (!resp.ok) showTips(await resp.text());
        else showTips('Submit Success!');
    };
    const handleDeleteTask = async () => {
        await mem.removeTask(study.value.type, study.value.word);
        studies.value = [...studies.value.slice(0, index.value), ...studies.value.slice(index.value+1)];
        study.value = studies.value[index.value];
        isPhaseAnswer.value = false;
    }
    useEffect(() => {
        addEventListener('keypress', handleKeyPress);
        return () => removeEventListener('keypress', handleKeyPress);
    }, []);
    return <Dialog title="学习" onCancel={onFinish}>
        <div class="pt-2 h-full flex flex-col bg-cover bg-center [text-shadow:1px_1px_1px_#E2E8F0,-1px_1px_1px_#E2E8F0,1px_-1px_1px_#E2E8F0,-1px_-1px_1px_#E2E8F0] dark:[text-shadow:1px_1px_1px_#1E293B,-1px_1px_1px_#1E293B,1px_-1px_1px_#1E293B,-1px_-1px_1px_#1E293B]" style={(isPhaseAnswer.value && study.value.pic) ? `background-image: url(${study.value.pic});` : ''}>
            <div class="px-2 flex gap-2 text-lg">
                <SButton disabled={index.value <= 0} onClick={handlePrevious}>
                    <IconChevronsLeft class="bg-slate-200 dark:bg-slate-800 rounded-md w-6 h-6" />
                </SButton>
                <div>{index.value+1}/{studies.value.length}</div>
                <SButton disabled={index.value >= studies.value.length} onClick={handleNext}>
                    <IconChevronsRight class="bg-slate-200 dark:bg-slate-800 rounded-md w-6 h-6" />
                </SButton>
                <div class="grow"/>
                <SButton disabled={!isPhaseAnswer.value} onClick={handleSkilled}>
                    <IconCircleLetterF class="bg-slate-200 dark:bg-slate-800 rounded-md w-6 h-6" />
                </SButton>
                <SButton disabled={!isPhaseAnswer.value} onClick={handleDeleteTask}>
                    <IconCut class="bg-slate-200 dark:bg-slate-800 rounded-md w-6 h-6"/>
                </SButton>
                <SButton disabled={!isPhaseAnswer.value} onClick={handleReportIssue}>
                    <IconAlertCircleFilled class="bg-slate-200 dark:bg-slate-800 rounded-md w-6 h-6"/>
                </SButton>
                <SButton disabled={!isPhaseAnswer.value} onClick={handleRefresh}>
                    <IconRefresh class="bg-slate-200 dark:bg-slate-800 rounded-md w-6 h-6"/>
                </SButton>
                <div>{study.value.level}</div>
            </div>
            <div class="px-2 h-10">
                {shouldSpell.value && <span class="text-4xl font-bold">{study.value.word}</span>}
            </div>
            <div class="grow flex">
                <div class="grow text-2xl">
                    {isPhaseAnswer.value && <>
                        <div class="pl-2 pt-2">{study.value.phonetic}</div>
                        <div class="pl-2 pb-2">{study.value.trans?.split('\n').map(t => <p>{t}</p>)}</div>
                    </>}
                </div>
                <div class="shrink-0 p-2 flex flex-col gap-4 text-lg justify-center">
                    <NButton onClick={handleSpeakIt} title="_" disabled={!shouldSound.value}>播放</NButton>
                    <NButton onClick={handleShowAnswer} title="_" disabled={isPhaseAnswer.value}>答案</NButton>
                    <NButton onClick={handleIKnown} title="X/N" disabled={!isPhaseAnswer.value}>知道</NButton>
                    <NButton onClick={handleDontKnow} title="Z/M" disabled={!isPhaseAnswer.value}>不会</NButton>
                </div>
            </div>
            <audio ref={player} src={shouldSound.value ? study.value.sound : undefined} autoplay/>
        </div>
    </Dialog>;
}