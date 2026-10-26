import { Show } from "solid-js";

export default (props: { meaning: string; hideMinus?: true }) => {
   const [o, r] = props.meaning.split(/\t+/);
   return (
      <p>
         <Show when={!props.hideMinus}>&ensp;-&ensp;</Show>
         <Show when={o}>
            <span innerHTML={o} />
         </Show>
         <Show when={o && r}>&ensp;&ensp;</Show>
         <Show when={r}>
            <span class="font-bold" innerHTML={r} />
         </Show>
      </p>
   );
};
