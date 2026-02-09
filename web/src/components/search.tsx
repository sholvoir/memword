import BButton from "@sholvoir/solid-components/button-base";
import TInput from "@sholvoir/solid-components/input-text";
import { type Accessor, createSignal, type Setter } from "solid-js";
import type { IItem } from "src/lib/iitem.ts";
import type { TDial } from "../lib/idial.ts";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog.tsx";

export default ({
   showTips,
   setCItem,
   setPhaseAnswer,
   setSprint,
   vocabulary,
   go,
}: {
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
      if (!item) return showTips("Not Found!");
      setCItem(item);
      setPhaseAnswer(true);
      setSprint(-1);
      go("#study");
   };
   return (
      <Dialog
         class="flex flex-col text-lg"
         left={
            <BButton
               class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
               onClick={() => go()}
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
            options={vocabulary()}
         />
      </Dialog>
   );
};
