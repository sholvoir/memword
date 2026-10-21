import type { IEntry } from "@sholvoir/dict-server/src/lib/imic";
import { For, Show } from "solid-js";

export default (props: { entry: IEntry }) => (
   <div class="[&>p>t]:font-bold">
      <div class="flex gap-4 text-xl">
         <div class="font-bold text-(--accent-color)">{props.entry.pos}</div>
         <For each={props.entry.pronounces}>
            {(pronounce) => <div>{pronounce.phonetic}</div>}
         </For>
      </div>
      <Show when={props.entry.top}>
         <p innerHTML={props.entry.top}></p>
      </Show>
      <For each={props.entry.meanings}>
         {(meaning) => <p innerHTML={`&ensp;-&ensp;${meaning}`} />}
      </For>
   </div>
);
