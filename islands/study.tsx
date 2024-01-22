// deno-lint-ignore-file no-explicit-any
import { useEffect, useRef } from "preact/hooks";
import { Signal, useSignal, useComputed } from "@preact/signals";
import { IStudy } from "../lib/istudy.ts";
import * as mem from '../lib/mem.ts';
import IconCut from "tabler_icons/cut.tsx";
import IconRefresh from "tabler_icons/refresh.tsx";
import IconAlertCircleFilled from "tabler_icons/alert-circle-filled.tsx";
import SButton from './button-anti-shake.tsx';
import NButton from './button-normal.tsx';
import AButton from './button-anchor.tsx';

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
    const handleDelteTask = async () => {
        await mem.removeTask(study.value.type, study.value.word);
        studies.value = [...studies.value.slice(0, index.value), ...studies.value.slice(index.value+1)];
        study.value = studies.value[index.value];
    }
    useEffect(() => {
        addEventListener('keypress', handleKeyPress);
        return () => removeEventListener('keypress', handleKeyPress);
    }, []);
    return <div class="flex flex-col flex-1 h-full relative">
        <div class="flex gap-2 text-lg">
            <AButton onClick={handlePrevious} disabled={index.value <= 0 }>{'<<'}</AButton>
            <div>{index.value+1}/{studies.value.length}</div>
            <AButton onClick={handleNext} disabled={index.value >= studies.value.length}>{'>>'}</AButton>
            <div class="grow"/>
            <SButton disabled={!shouldSound.value} onClick={handleSpeakIt}><img src="/sound.svg" class="w-6 h-6"/></SButton>
            <SButton disabled={!isPhaseAnswer.value} onClick={handleDelteTask}><IconCut class="w-6 h-6"/></SButton>
            <SButton disabled={!isPhaseAnswer.value} onClick={handleReportIssue}><IconAlertCircleFilled class="w-6 h-6"/></SButton>
            <SButton disabled={!isPhaseAnswer.value} onClick={handleRefresh}><IconRefresh class="w-6 h-6"/></SButton>
            <div>Level: {study.value.level}</div>
        </div>
        <div class="grow text-2xl">
            {shouldSpell.value && <div class="text-4xl font-bold">{study.value.word}</div>}
            {isPhaseAnswer.value && <div>{study.value.phonetic}</div>}
            {isPhaseAnswer.value && study.value.pic && <img src={study.value.pic} />}
            {isPhaseAnswer.value && <div><pre>{study.value.trans}</pre></div>}
        </div>
        <audio ref={player} src={shouldSound.value ? study.value.sound : undefined} autoplay/>
        <div class="absolute bottom-3 right-2 flex flex-col gap-1">
            <NButton class="grow" onClick={handleShowAnswer} title="_" disabled={isPhaseAnswer.value}>Answer</NButton>
            <NButton class="grow" onClick={handleIKnown} title="X/N" disabled={!isPhaseAnswer.value}>Known</NButton>
            <NButton class="grow" onClick={handleDontKnow} title="Z/M" disabled={!isPhaseAnswer.value}>Don't</NButton>
        </div>
    </div>;
}