import { createSignal } from "solid-js";

export const [search, setSearch] = createSignal<string>();
export const [bid, setBid] = createSignal<string>();
export const [blevel, setBlevel] = createSignal<number>();
