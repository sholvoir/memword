import { wait } from "@sholvoir/generic/wait";
import type { DivTargeted } from "@sholvoir/solid-components/targeted";
import { onCleanup, onMount, splitProps } from "solid-js";
import Dialog, { type DialogProps } from "./dialog";

export default (
   props: DialogProps & {
      afterAnimation?: (down?: boolean) => Promise<void>;
      beforeAnimation?: (down?: boolean) => Promise<void>;
      onClick?: (e?: MouseEvent & DivTargeted) => void;
      onKeyup?: (e: KeyboardEvent) => void;
      touchEnabled?: boolean;
   },
) => {
   const [local, others] = splitProps(props, [
      "children",
      "onKeyup",
      "onClick",
      "touchEnabled",
      "beforeAnimation",
      "afterAnimation",
   ]);
   const touchPos = {
      startY: 0,
      endY: 0,
      offset: 0,
      canUp: false,
      canDown: false,
   };
   const continueMove = async (div: HTMLDivElement, x: number) => {
      div.style.top = `${(touchPos.offset += x)}px`;
      if (Math.abs(touchPos.offset) < globalThis.innerHeight) {
         await wait(30);
         await continueMove(div, x);
      }
   };
   const handleTouchStart = (e: TouchEvent & DivTargeted) => {
      if (!local.touchEnabled) return;
      const div = e.currentTarget;
      touchPos.endY = touchPos.startY = e.touches[0].clientY;
      touchPos.offset = 0;
      touchPos.canDown = e.currentTarget.scrollTop <= 3;
      touchPos.canUp = div.scrollHeight - div.clientHeight - div.scrollTop <= 3;
   };
   const handleTouchMove = (e: TouchEvent & DivTargeted) => {
      if (!local.touchEnabled) return;
      touchPos.endY = e.touches[0].clientY;
      const diff = touchPos.endY - touchPos.startY;
      if ((diff < 0 && touchPos.canUp) || (diff > 0 && touchPos.canDown)) {
         e.currentTarget.style.top = `${(touchPos.offset = diff)}px`;
         e.stopPropagation();
         e.preventDefault();
      }
   };
   const handleTouchCancel = (e: TouchEvent & DivTargeted) => {
      if (!local.touchEnabled) return;
      e.currentTarget.style.top = `${(touchPos.offset = 0)}`;
   };
   const handleTouchEnd = async (e: TouchEvent & DivTargeted) => {
      const div = e.currentTarget;
      if (Math.abs(touchPos.offset) >= globalThis.innerHeight / 6) {
         const down = touchPos.offset > 0;
         if (local.beforeAnimation) await local.beforeAnimation(down);
         await continueMove(div, down ? 60 : -60);
         if (local.afterAnimation) await local.afterAnimation(down);
      }
      div.style.top = `${(touchPos.offset = 0)}`;
   };
   if (local.onKeyup) {
      onMount(() => document.addEventListener("keyup", local.onKeyup!));
      onCleanup(() => document.removeEventListener("keyup", local.onKeyup!));
   }
   return (
      <Dialog
         {...others}
         on:click={local.onClick}
         on:touchstart={handleTouchStart}
         on:touchmove={handleTouchMove}
         on:touchend={handleTouchEnd}
         on:touchcancel={handleTouchCancel}
      >
         {local.children}
      </Dialog>
   );
};
