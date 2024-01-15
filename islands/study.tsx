// deno-lint-ignore-file no-explicit-any
import { useRef, useEffect } from "preact/hooks";
import { Signal, useSignal, useComputed } from "@preact/signals";
import { IStudy } from "../lib/istudy.ts";
import * as mem from '../lib/mem.ts';

interface StudyProps {
    studies: Signal<Array<IStudy>>;
    onFinish: () => void;
};

export default ({ studies, onFinish }: StudyProps) => {
    const index = useSignal(0);
    const isPhaseAnswer = useSignal(false);
    const study = useComputed(() => studies.value[index.value])
    const shouldSound = useComputed(() => isPhaseAnswer.value || study.value.task.type == 'L');
    const shouldSpell = useComputed(() => isPhaseAnswer.value || study.value.task.type == 'R');
    const player = useRef<HTMLAudioElement>(null);
    if (!study.value) return (onFinish(), <div/>);

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
    const handleSpeakIt = () => player.current && player.current.play();
    const handleShowAnswer = () => isPhaseAnswer.value = true;
    const handleIKnown = async () => {
        await mem.study(study.value.task);
        if (isPhaseAnswer.value) handleNext();
        else (isPhaseAnswer.value = true , setTimeout(handleNext, 3000));
    };
    const handleDontKnow = () => {
        study.value.task.level = 0;
        handleIKnown();
    };
    const handleNext = () => {
        if (index.value >= studies.value.length) return onFinish();
        index.value++;
        isPhaseAnswer.value = false;
    };
    const handlePrevious = () => {
        index.value--;
        isPhaseAnswer.value = false;
    }
    useEffect(() => {
        addEventListener('keypress', handleKeyPress);
        return () => removeEventListener('keypress', handleKeyPress);
    }, []);
    return <div class="flex flex-col flex-1 h-full">
        <div class="flex gap-2">
            <a class="disabled:opacity-50 hover:underline text-blue-800" onClick={handlePrevious} disabled={index.value <= 0 }>{'<<'}</a>
            <div>{index.value+1}/{studies.value.length}</div>
            <a class="disabled:opacity-50 hover:underline text-blue-800" onClick={handleNext} disabled={index.value >= studies.value.length}>{'>>'}</a>
            <div class="grow text-right">Level: {study.value.task.level}</div>
        </div>
        <div class="flex-1">
            {shouldSpell.value && <div class="text-4xl">{study.value.task.word}</div>}
            {isPhaseAnswer.value && <div>{study.value.dict?.phonetic}</div>}
            {isPhaseAnswer.value && study.value.dict!.pic && <img src={study.value.dict!.pic} />}
            {isPhaseAnswer.value && <div><pre>{study.value.dict!.trans}</pre></div>}
        </div>
        <div class="flex gap-1 [&>menu]:text-center [&>menu]:hover:cursor-pointer [&>menu]:grow [&>menu]:p-px [&>menu]:rounded [&>menu]:bg-gray-300 [&>menu]:disabled:opacity-50">
            <menu onClick={handleShowAnswer}>Answer(_)</menu>
            <menu onClick={handleSpeakIt} disabled={!shouldSound.value}>Read(B/C)</menu>
            <menu onClick={handleDontKnow} disabled={!isPhaseAnswer.value}>Don't(Z/M)</menu>
            <menu onClick={handleIKnown} disabled={!isPhaseAnswer.value}>Known(X/N)</menu>
        </div>
        <audio ref={player} src={study.value.dict?.sound} autoplay={shouldSound.value}/>
    </div>;
}