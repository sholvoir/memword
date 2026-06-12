import { createSignal } from "solid-js";
import { go } from "./provider-g.ts";

const [search, setSearch] = createSignal<string>();
const [bid, setBid] = createSignal<string>();
const [blevel, setBlevel] = createSignal<number>();

export { search, bid, blevel };

export const goStudy = (bid?: string, blevel?: number, search?: string) => {
   setBid(bid);
   setBlevel(blevel);
   setSearch(search);
   go("#study");
};
