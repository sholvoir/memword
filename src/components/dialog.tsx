import BButton from "@sholvoir/solid-components/button-base";
import { type Accessor, type JSX, Show, splitProps } from "solid-js";
import Loading from "./icon-loading.tsx";

export type DialogProps = {
   left?: JSX.Element;
   leftClick?: () => void;
   right?: JSX.Element;
   showLoading?: Accessor<boolean>;
   tips?: Accessor<string | undefined>;
   title: JSX.Element;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "title">;

export default (props: DialogProps) => {
   const [local, others] = splitProps(props, [
      "children",
      "class",
      "left",
      "leftClick",
      "right",
      "showLoading",
      "tips",
      "title",
   ]);
   return (
      <>
         <div
            class={`title shrink-0 px-2 flex justify-between items-center font-bold ${
               local.tips?.() ? "bg-(--bg-accent)" : "bg-(--bg-title)"
            } text-center`}
         >
            <div class="min-w-7 [app-region:no-drag]">
               <Show
                  when={local.left}
                  fallback={
                     <Show when={local.leftClick}>
                        <BButton
                           class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
                           onClick={local.leftClick}
                        />
                     </Show>
                  }
               >
                  {local.left}
               </Show>
            </div>
            <div class="grow font-bold [app-region:drag]">
               {local.tips?.() || local.title}
            </div>
            <div class="min-w-7 [app-region:no-drag]">
               <Show when={local.right}>{local.right}</Show>
            </div>
         </div>
         <div class={`body relative grow h-0 ${local.class ?? ""}`} {...others}>
            {local.children}
            <Show when={local.showLoading?.()}>
               <div class="absolute inset-0 bg-(--bg-half) flex justify-center content-center flex-wrap">
                  <Loading class="w-16 h-16" />
               </div>
            </Show>
         </div>
      </>
   );
};
