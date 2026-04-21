import BButton from "@sholvoir/solid-components/button-base";
import { type Accessor, type JSX, Show, splitProps } from "solid-js";
import { useG } from "./g-provider.tsx";
import Loading from "./icon-loading.tsx";

export type DialogProps = {
   bottom?: JSX.Element;
   left?: JSX.Element;
   leftClick?: () => void;
   noleft?: boolean;
   right?: JSX.Element;
   tips?: Accessor<string | undefined>;
   title: JSX.Element;
   tools?: JSX.Element;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "title">;

export default (props: DialogProps) => {
   const [local, others] = splitProps(props, [
      "bottom",
      "children",
      "class",
      "left",
      "leftClick",
      "noleft",
      "right",
      "title",
      "tools",
   ]);
   const { tips, go, loading } = useG()!;
   return (
      <>
         <div
            class={`title shrink-0 px-2 flex justify-between items-center font-bold ${
               tips() ? "bg-(--bg-accent)" : "bg-(--bg-title)"
            } text-center`}
         >
            <div class="min-w-7 [app-region:no-drag]">
               <Show
                  when={local.left}
                  fallback={
                     <Show when={!local.noleft}>
                        <BButton
                           class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
                           onClick={local.leftClick ?? (() => go())}
                        />
                     </Show>
                  }
               >
                  {local.left}
               </Show>
            </div>
            <div class="grow font-bold [app-region:drag]">
               {tips() || local.title}
            </div>
            <div class="min-w-7 [app-region:no-drag]">
               <Show when={local.right}>{local.right}</Show>
            </div>
         </div>
         <Show when={local.tools}>{local.tools}</Show>
         <div class={`body relative grow h-0 ${local.class ?? ""}`} {...others}>
            {local.children}
         </div>
         <Show when={local.bottom}>{local.bottom}</Show>
         <div class="h-3"></div>
         <Show when={loading()}>
            <div class="absolute inset-0 bg-(--bg-half) flex justify-center content-center flex-wrap">
               <Loading class="w-16 h-16" />
            </div>
         </Show>
      </>
   );
};
