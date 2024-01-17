// deno-lint-ignore-file no-explicit-any
import { useEffect } from "preact/hooks";
import { Signal, useSignal, useComputed } from "@preact/signals";
import { ITask } from "../lib/itask.ts";
import * as mem from '../lib/mem.ts';
import { IDict } from "dict/lib/idict.ts";
import IconRefresh from "tabler_icons/refresh.tsx";
import IconAlertCircleFilled from "tabler_icons/alert-circle-filled.tsx";

interface StudyProps {
    tasks: Signal<Array<ITask>>;
    showTips: (content: string) => void;
    onFinish: () => void;
};

export default ({ tasks, showTips, onFinish }: StudyProps) => {
    const index = useSignal(0);
    const isPhaseAnswer = useSignal(false);
    const task = useComputed(() => tasks.value[index.value]);
    const dict = useSignal<IDict|undefined>(undefined);
    const shouldSound = useComputed(() => isPhaseAnswer.value || task.value.type == 'L');
    const shouldSpell = useComputed(() => isPhaseAnswer.value || task.value.type == 'R');
    if (!task.value) return (onFinish(), <div/>);

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
        if (dict.value && dict.value.sound && shouldSound.value)
            new Audio(dict.value.sound).play();
    };
    const handleShowAnswer = () => isPhaseAnswer.value = true;
    const handleIKnown = async () => {
        await mem.study(task.value);
        if (isPhaseAnswer.value) handleNext();
        else (isPhaseAnswer.value = true , setTimeout(handleNext, 3000));
    };
    const handleDontKnow = () => {
        task.value.level = 0;
        handleIKnown();
    };
    const handleNext = () => {
        if (index.value >= tasks.value.length) return onFinish();
        index.value++;
        isPhaseAnswer.value = false;
        dict.value = undefined;
    };
    const handlePrevious = () => {
        if (index.value <= 0) return onFinish();
        index.value--;
        isPhaseAnswer.value = false;
        dict.value = undefined;
    };
    const handleRefresh = async () => {
        dict.value = await mem.getDict(task.value.word, true);
    };
    const handleReportIssue = async () => {
        const resp = await mem.submitIssue(task.value.word);
        if (!resp.ok) showTips(await resp.text());
        else showTips('Submit Success!');
    };
    useEffect(() => {
        addEventListener('keypress', handleKeyPress);
        return () => removeEventListener('keypress', handleKeyPress);
    }, []);
    const init = async () => {
        if (!dict.value) dict.value = await mem.getDict(task.value.word);
        handleSpeakIt();
    }
    useEffect(() => { init().catch(console.error) }, [dict.value, shouldSound.value]);
    return <div class="flex flex-col flex-1 h-full pb-3">
        <div class="flex gap-2">
            <a class="disabled:opacity-50 hover:underline text-blue-800" onClick={handlePrevious} disabled={index.value <= 0 }>{'<<'}</a>
            <div>{index.value+1}/{tasks.value.length}</div>
            <a class="disabled:opacity-50 hover:underline text-blue-800" onClick={handleNext} disabled={index.value >= tasks.value.length}>{'>>'}</a>
            <div class="grow"/>
            <button type="button" class="disabled:opacity-50" disabled={!isPhaseAnswer.value} onClick={handleReportIssue}><IconAlertCircleFilled class="w-5 h-5" /></button>
            <button type="button" class="disabled:opacity-50" disabled={!isPhaseAnswer.value} onClick={handleRefresh}><IconRefresh class="w-5 h-5"/></button>
            <div>Level: {task.value.level}</div>
        </div>
        <div class="grow text-3xl">
            {shouldSpell.value && <div class=" text-5xl">{task.value.word}</div>}
            {isPhaseAnswer.value && <div>{dict.value?.phonetic}</div>}
            {isPhaseAnswer.value && dict.value?.pic && <img src={dict.value?.pic} />}
            {isPhaseAnswer.value && <div><pre>{dict.value?.trans}</pre></div>}
        </div>
        <div class="flex gap-1 [&>button]:text-center [&>button]:grow [&>button]:px-px [&>button]:py-2 [&>button]:rounded [&>button]:bg-gray-300">
            <button type="button" onClick={handleShowAnswer} class="disabled:opacity-50" disabled={isPhaseAnswer.value}>Answer(_)</button>
            <button type="button" onClick={handleSpeakIt} class="disabled:opacity-50" disabled={!shouldSound.value}>Read(B/C)</button>
            <button type="button" onClick={handleDontKnow} class="disabled:opacity-50" disabled={!isPhaseAnswer.value}>Don't(Z/M)</button>
            <button type="button" onClick={handleIKnown} class="disabled:opacity-50" disabled={!isPhaseAnswer.value}>Known(X/N)</button>
        </div>
    </div>;
}