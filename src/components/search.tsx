import TInput from "@sholvoir/solid-components/input-text";
import { type Accessor, createSignal, type Setter } from "solid-js";
import type { IItem } from "src/lib/iitem.ts";
import * as mem from "../lib/mem.ts";
import Dialog from "./dialog.tsx";
import { useG } from "./g-provider.tsx";

export default (props: {
   setCItem: Setter<IItem | undefined>;
   setPhaseAnswer: Setter<boolean>;
   setSprint: Setter<number>;
   vocabulary: Accessor<Set<string>>;
}) => {
   const word = createSignal("");
   const { go, showTips } = useG()!;
   const handleSearchClick = async () => {
      const text = word[0]().trim();
      if (!text) return;
      const item = await mem.search(text);
      if (!item) return showTips("Not Found!");
      props.setCItem(item);
      props.setPhaseAnswer(true);
      props.setSprint(-1);
      go("#study");
   };
   return (
      <Dialog class="flex flex-col text-lg" title="词典">
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
