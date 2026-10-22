import { createStore } from "solid-js/store";
import { type ICard, newCard } from "../lib/icard";

export const [card, setCard] = createStore<ICard & { id?: string }>(
   newCard(""),
);
