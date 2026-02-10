import type { IEntry } from "@sholvoir/dict-server/src/lib/imic.ts";
import { For, Show } from "solid-js";

export default (props: { entry: IEntry; trans?: boolean }) => (
   <For each={Object.entries(props.entry.meanings!)}>
      {([pos, means]) => (
         <Show when={props.trans || pos !== "ecdict"}>
            <Show when={pos}>
               <p class="text-xl font-bold text-[var(--accent-color)]">{pos}</p>
            </Show>
            <For each={means}>
               {(mean) => <p innerHTML={`&ensp;-&ensp;${mean}`} />}
            </For>
         </Show>
      )}
   </For>
);
