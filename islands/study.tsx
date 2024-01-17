// deno-lint-ignore-file no-explicit-any
import { useEffect, useRef } from "preact/hooks";
import { Signal, useSignal, useComputed } from "@preact/signals";
import * as mem from '../lib/mem.ts';
import IconRefresh from "tabler_icons/refresh.tsx";
import IconAlertCircleFilled from "tabler_icons/alert-circle-filled.tsx";
import { IStudy } from "../lib/istudy.ts";

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
            case 32: handleShowAnswer(); break;
            case 78: case 88: case 110: case 120: handleIKnown(); break;
            case 77: case 90: case 109: case 122: handleDontKnow(); break;
            case 46: case 62: handleNext();
        }
    };
    const handleSpeakIt = () => {
        if (study.value.sound && shouldSound.value)
            new Audio(study.value.sound).play();
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
    useEffect(() => {
        addEventListener('keypress', handleKeyPress);
        return () => removeEventListener('keypress', handleKeyPress);
    }, []);
    return <div class="flex flex-col flex-1 h-full pb-3">
        <div class="flex gap-2">
            <a class="disabled:opacity-50 hover:underline text-blue-800" onClick={handlePrevious} disabled={index.value <= 0 }>{'<<'}</a>
            <div>{index.value+1}/{studies.value.length}</div>
            <a class="disabled:opacity-50 hover:underline text-blue-800" onClick={handleNext} disabled={index.value >= studies.value.length}>{'>>'}</a>
            <div class="grow"/>
            <button type="button" class="disabled:opacity-50" disabled={!isPhaseAnswer.value} onClick={handleReportIssue}><IconAlertCircleFilled class="w-5 h-5" /></button>
            <button type="button" class="disabled:opacity-50" disabled={!isPhaseAnswer.value} onClick={handleRefresh}><IconRefresh class="w-5 h-5"/></button>
            <div>Level: {study.value.level}</div>
        </div>
        <div class="grow text-2xl">
            {shouldSpell.value && <div class="text-4xl font-bold">{study.value.word}</div>}
            {isPhaseAnswer.value && <div>{study.value.phonetic}</div>}
            {isPhaseAnswer.value && study.value.pic && <img src={study.value.pic} />}
            {isPhaseAnswer.value && <div><pre>{study.value.trans}</pre></div>}
        </div>
        <div class="flex gap-1 [&>button]:text-center [&>button]:grow [&>button]:px-px [&>button]:py-2 [&>button]:rounded [&>button]:bg-gray-300">
            <button type="button" onClick={handleShowAnswer} class="disabled:opacity-50" disabled={isPhaseAnswer.value}>Answer(_)</button>
            <button type="button" onClick={handleSpeakIt} class="disabled:opacity-50" disabled={!shouldSound.value}>Read(B/C)</button>
            <button type="button" onClick={handleDontKnow} class="disabled:opacity-50" disabled={!isPhaseAnswer.value}>Don't(Z/M)</button>
            <button type="button" onClick={handleIKnown} class="disabled:opacity-50" disabled={!isPhaseAnswer.value}>Known(X/N)</button>
        </div>
        <audio ref={player} src={shouldSound.value ? study.value.sound : undefined} autoplay/>
    </div>;
}