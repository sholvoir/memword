// deno-lint-ignore-file no-explicit-any
import { useState } from "preact/hooks";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";
import { IDict } from "../lib/idict.ts";

const baseApi = '/api/dict';

export default function Counter() {
  const [prompt, setPrompt] = useState('');
  const [word, setWord] = useState('');
  const [trans, setTrans] = useState('');
  const [sound, setSound] = useState('');
  const [phonetics, setPhonetics] = useState('');
  return (
    <>
      <div class="m-1 text-red-500">{prompt}</div>
      <div class="m-1 flex space-x-2">
        <input type="text" class="flex-grow border px-2" value={word} onInput={({target})=>setWord((target as any).value)} />
        <button type="button" class="w-20 border rounded-md px-2 bg-blue-800 text-white"
          onClick={async () => {
            const res = await fetch(`${baseApi}/${encodeURIComponent(word)}`);
            if (res.ok) {
              const {trans, sound, phonetics } = await res.json() as IDict;
              setPhonetics(phonetics!);
              setTrans(trans!);
              setSound(sound!);
              setPrompt('');
            } else {
              setPrompt(await res.text());
            }
          }}>Search</button>
      </div>
      <div class="m-1 flex space-x-2">
        <input type="text" class="flex-grow-1 border px-2" value={phonetics} onInput={({target})=>setPhonetics((target as any).value)} />
        <input type="text" class="flex-grow-4 border px-2" value={trans} onInput={({target})=>setTrans((target as any).value)} />
      </div>
      <div class="m-1 flex space-x-2">
        <input type="text" class="flex-grow-1 border" value={sound} onInput={({target})=>setSound((target as any).value)} />
        <IconPlayerPlayFilled class="w-6 h-6"  onClick={() => {
          if (sound) {
            try {
              (new Audio(sound)).play();
              setPrompt('');
            } catch (e) {
              setPrompt(e.toString());
            }
          } else {
            setPrompt('no sound to play!')
          }
        }}/>
      </div>
      <div class="m-1 flex space-x-2">
        <div class="flex-grow"></div>
        <button type="botton" class="w-20 border rounded-md px-2 bg-blue-800 text-white" onClick={async () => {
          const res = await fetch(`${baseApi}/${encodeURIComponent(word)}`, {method: 'PATCH', cache: 'no-cache', body: JSON.stringify({trans, sound, phonetics})});
          if (res.ok) {
            setPrompt(`success upate word "${word}"!`);
          } else {
            setPrompt(await res.text());
          }
        }}>Update</button>
      </div>
    </>
  );
}
