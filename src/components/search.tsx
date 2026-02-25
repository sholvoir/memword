import BButton from "@sholvoir/solid-components/button-base";
import TInput from "@sholvoir/solid-components/input-text";
import { type Accessor, createSignal, type Setter } from "solid-js";
import type { IItem } from "src/lib/iitem.ts";
import type { TDial } from "../lib/idial.ts";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog.tsx";

export default (props: {
   showTips: (content: string, autohide?: boolean) => void;
   setCItem: Setter<IItem | undefined>;
   setPhaseAnswer: Setter<boolean>;
   setSprint: Setter<number>;
   vocabulary: Accessor<Set<string>>;
   go: (d?: TDial) => void;
}) => {
   const word = createSignal("");
   const handleSearchClick = async () => {
      const text = word[0]().trim();
      if (!text) return;
      const item = await mem.search(text);
      if (!item) return props.showTips("Not Found!");
      props.setCItem(item);
      props.setPhaseAnswer(true);
      props.setSprint(-1);
      props.go("#study");
   };
   return (
      <Dialog
         class="flex flex-col text-lg"
         left={
            <BButton
               class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
               onClick={() => props.go()}
            />
         }
         title="词典"
      >
         <TInput
            autoCapitalize="none"
            type="search"
            name="word"
            placeholder="word"
            class="m-2 w-[calc(100%-16px)]"
            binding={word}
            onChange={handleSearchClick}
            options={props.vocabulary()}
         />
      </Dialog>
   );
};
