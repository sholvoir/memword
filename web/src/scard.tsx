import type { IEntry } from "@sholvoir/memword-common/idict";
import { marked } from "marked";
import { For, Show } from "solid-js";

const pReges = /<\/?p>/g;

export default (props: { entry: IEntry; trans?: boolean }) => (
   <For each={Object.entries(props.entry.meanings!)}>
      {([pos, means]) => (
         <Show when={props.trans || pos !== "ecdict"}>
            <Show when={pos}>
               <p class="text-xl font-bold text-[var(--accent-color)]">{pos}</p>
            </Show>
            <For each={means}>
               {(item) => (
                  <p>
                     <span>&ensp;-&ensp;</span>
                     <Show when={item.def}>
                        <span
                           class="text-lg"
                           innerHTML={marked
                              .parse(item.def!, { async: false })
                              .replace(pReges, "")}
                        ></span>
                     </Show>
                     <Show when={props.trans && item.def && item.trans}>
                        <span>&ensp;</span>
                     </Show>
                     <Show when={props.trans && item.trans}>
                        <span class="text-xl font-bold">{item.trans}</span>
                     </Show>
                  </p>
               )}
            </For>
         </Show>
      )}
   </For>
);
