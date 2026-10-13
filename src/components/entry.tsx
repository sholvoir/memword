import type { IEntry } from "@sholvoir/dict-server/src/lib/imic";
import { For } from "solid-js";

export default (props: { entry: IEntry }) => (
   <div class="[&>p>t]:font-bold">
      <div class="flex gap-4 text-xl">
         <div class="font-bold text-(--accent-color)">{props.entry.pos}</div>
         <div>{props.entry.phonetic}</div>
      </div>
      <For each={props.entry.meanings?.split("\n")}>
         {(meaning) => <p innerHTML={`&ensp;-&ensp;${meaning}`} />}
      </For>
   </div>
);
