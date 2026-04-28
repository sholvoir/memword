import { createSignal } from "solid-js";
import type { IBook } from "../lib/ibook.ts";

export const [book, setBook] = createSignal<IBook>();
