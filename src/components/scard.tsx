import { For, Show } from "solid-js";

export default ({ meanings }: { meanings?: Record<string, string[]> }) => (
   <Show when={meanings}>
      <For each={Object.entries(meanings!)}>
         {([pos, means]) => (
            <>
               <Show when={pos}>
                  <p class="text-xl font-bold text-(--accent-color)">{pos}</p>
               </Show>
               <For each={means}>
                  {(mean) => <p innerHTML={`&ensp;-&ensp;${mean}`} />}
               </For>
            </>
         )}
      </For>
   </Show>
);
