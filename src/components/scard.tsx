import { For, Show } from "solid-js";

export default (props: {
   meanings?: Record<string, string[]>;
   showTrans?: boolean;
}) => (
   <Show when={props.meanings}>
      <div
         class={`grow [&>p>strong]:${props.showTrans ? "text-lg" : "hidden"}`}
      >
         <For each={Object.entries(props.meanings!)}>
            {([pos, means]) => (
               <>
                  <Show when={pos}>
                     <p class="text-xl font-bold text-(--accent-color)">
                        {pos}
                     </p>
                  </Show>
                  <For each={means}>
                     {(mean) => <p innerHTML={`&ensp;-&ensp;${mean}`} />}
                  </For>
               </>
            )}
         </For>
      </div>
   </Show>
);
