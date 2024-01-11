// deno-lint-ignore-file no-explicit-any
import { useRef, useEffect } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";
import { getDict, study } from '../lib/mem.ts';
import { ITask } from "../lib/itask.ts";
import { IDict } from "dict/lib/idict.ts";

interface StudyProps {
    tasks: Signal<Array<ITask>>;
    onFinish: () => void;
};

export default ({ tasks, onFinish }: StudyProps) => {
    const index = useSignal(0);
    const isPhaseAnswer = useSignal(false);
    const dict = useSignal<IDict | null>(null);
    const player = useRef<HTMLAudioElement>(null);
    if (!tasks.value[index.value]) return (onFinish(), <div/>);

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
    const handleIKnown = () => {
        study(tasks.value[index.value]);
        if (isPhaseAnswer.value) handleNext();
        else (isPhaseAnswer.value = true , setTimeout(handleNext, 5000));
    };
    const handleDontKnow = () => {
        tasks.value[index.value].level = 0;
        handleIKnown();
    };
    const handleNext = () => {
        if (index.value >= tasks.value.length) return onFinish();
        index.value++;
        isPhaseAnswer.value = false;
        dict.value = null;
    };
    const handlePrevious = () => {
        index.value--;
        isPhaseAnswer.value = false;
        dict.value = null;
    }
    const shouldSound = () => dict.value && dict.value.sound && (isPhaseAnswer.value || tasks.value[index.value].type == 'L');
    const shouldSpell = () => isPhaseAnswer.value || tasks.value[index.value].type == 'R';
    const init = async () => {
        if (!dict.value) dict.value = await getDict(tasks.value[index.value].word);
        if (shouldSound() && player.current) {
            player.current.src = dict.value!.sound!;
            player.current.play();
        }
    };
    useEffect(() => {
        addEventListener('keypress', handleKeyPress);
        return () => removeEventListener('keypress', handleKeyPress);
    }, []);
    useEffect(() => { init().catch(console.error) });
    return <div class="flex flex-col flex-1 h-full">
        <div class="flex gap-2">
            <a class="disabled:opacity-50 hover:underline text-blue-800" onClick={handlePrevious} disabled={index.value <= 0 }>{'<<'}</a>
            <div>{index.value+1}/{tasks.value.length}</div>
            <a class="disabled:opacity-50 hover:underline text-blue-800" onClick={handleNext} disabled={index.value >= tasks.value.length}>{'>>'}</a>
            <div class="grow text-right">Level: {tasks.value[index.value].level}</div>
        </div>
        <div class="flex-1">
            {shouldSpell() && <div class="text-4xl">{tasks.value[index.value].word}</div>}
            {isPhaseAnswer.value && <div>{dict.value?.phonetic}</div>}
            {isPhaseAnswer.value && dict.value && dict.value.pic && <img src={dict.value.pic} />}
            {isPhaseAnswer.value && dict.value && <div><pre>{dict.value.trans}</pre></div>}
        </div>
        <div class="flex gap-1 [&>menu]:text-center [&>menu]:hover:cursor-pointer [&>menu]:grow [&>menu]:p-px [&>menu]:rounded [&>menu]:bg-gray-300">
            <menu onClick={handleShowAnswer}>Answer(_)</menu>
            <menu onClick={handleSpeakIt}>Read(B/C)</menu>
            <menu onClick={handleDontKnow}>Don't(Z/M)</menu>
            <menu onClick={handleIKnown}>Known(X/N)</menu>
        </div>
        <audio ref={player} />
    </div>;
}