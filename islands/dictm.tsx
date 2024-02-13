import { Signal, useComputed, useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { IStudy } from '../lib/istudy.ts';
import { IDict } from "dict/lib/idict.ts";
import { signals, showTips } from "../lib/mem.ts";
import SButton from './button-anti-shake.tsx';
import NButton from './button-normal.tsx';
import TInput from './input-text.tsx';
import AInput from './input-textarea.tsx';
import Dialog from './dialog.tsx';
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";

const baseApi = 'https://dict.sholvoir.com/api'
export default (props: {study?: Signal<IStudy>}) => {
    const current = props.study!
    const phonetic = useSignal(current.value.phonetic);
    const trans = useSignal(current.value.trans);
    const pic = useSignal(current.value.pic);
    const sound = useSignal(current.value.sound);
    const player = useRef<HTMLAudioElement>(null);
    const handlePlayClick = () => sound.value && player.current?.play();
    const handleUpdateClick = async () => {
        const dict: IDict = { pic: pic.value, trans: trans.value, sound: sound.value, phonetic: phonetic.value };
        current.value = { ...current.value, ...dict };
        const res = await fetch(`${baseApi}/${encodeURIComponent(current.value.word)}`, { credentials: "include", method: 'PATCH', body: JSON.stringify(dict) });
        if (res.ok) showTips(`success update word "${current.value.word}"!`);
        else showTips(`Error: ${res.status}`);
    };
    return <Dialog title="词典维护">
        <div class="p-2 h-full flex flex-col gap-2 bg-cover bg-center text_thick-shadow" style={pic.value ? `background-image: url(${pic.value});` : ''}>
            <div class="text-4xl font-bold">{current.value.word}</div>
            <TInput class="text_thick-shadow" name="phonetic" binding={phonetic}/>
            <AInput class="grow text_thick-shadow" name="trans" binding={trans}/>
            <AInput class="h-32 text_thick-shadow" name="pic" binding={pic}/>
            <AInput class="grow text_thick-shadow" name="sound" binding={sound}/>
            <div class="w-full flex gap-2 justify-between">
                <NButton class="w-20" disabled={!signals.admin.value} onClick={handleUpdateClick}>Update</NButton>
                <SButton disabled={!sound.value} onClick={handlePlayClick}><IconPlayerPlayFilled class="bg-round-6"/></SButton>
            </div>
            <audio ref={player} src={sound.value}/>
        </div>
    </Dialog>;
}