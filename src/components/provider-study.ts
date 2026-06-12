import { createSignal } from "solid-js";
import { go } from "./provider-g.ts";

export const [search, setSearch] = createSignal<string>();
const [bid, setBid] = createSignal<string>();
const [blevel, setBlevel] = createSignal<number>();

export { bid, blevel };

export const goStudy = (bid?: string, blevel?: number) => {
   setBid(bid);
   setBlevel(blevel);
   go("#study");
};
