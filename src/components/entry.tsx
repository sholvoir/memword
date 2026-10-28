import type { IEntry } from "@sholvoir/dict-server/src/lib/imic";
import { For, Show } from "solid-js";
import Meaning from "./meaning";

export default (props: { entry: IEntry }) => (
   <div>
      <div class="flex flex-wrap gap-3 text-xl">
         <div class="font-bold text-(--accent-color)">{props.entry.pos}</div>
         <For each={props.entry.pronounces}>
            {(pronounce) => <div>{pronounce.phonetic}</div>}
         </For>
      </div>
      <Show when={props.entry.top}>
         <Meaning meaning={props.entry.top!} hideMinus={true} />
      </Show>
      <For each={props.entry.meanings?.split?.("\n")}>
         {(meaning) => <Meaning meaning={meaning} />}
      </For>
   </div>
);
