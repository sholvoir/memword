import { Show } from "solid-js";

export default (props: { meaning?: Array<string>; hideMinus?: true }) => {
   return (
      <p>
         <Show when={!props.hideMinus}>&ensp;-&ensp;</Show>
         <Show when={props.meaning?.[0]}>
            <span innerHTML={props.meaning?.[0]} />
         </Show>
         <Show when={props.meaning?.[0] && props.meaning?.[1]}>
            &ensp;&ensp;
         </Show>
         <Show when={props.meaning?.[1]}>
            <span class="font-bold" innerHTML={props.meaning?.[1]} />
         </Show>
      </p>
   );
};
