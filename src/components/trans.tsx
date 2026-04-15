import Button from "@sholvoir/solid-components/button-ripple";
import { createSignal } from "solid-js";
import { sentenceToWords } from "../lib/isentence.ts";
import * as mem from "../lib/mem.ts";
import * as srv from "../lib/server.ts";
import Dialog from "./dialog.tsx";
import { useG } from "./g-provider.tsx";

export default (props: {
   vocabulary: Set<string>;
   lamma: Record<string, string>;
}) => {
   const [sentence, setSentence] = createSignal("");
   const [trans, setTrans] = createSignal<string>("");
   const [words, setWords] = createSignal<string[]>([]);
   const { go, showTips } = useG()!;
   const handleSentenceOnInput = (
      e: InputEvent & {
         currentTarget: HTMLTextAreaElement;
         target: HTMLTextAreaElement;
      },
   ) => {
      setSentence(e.target.value);
      const result = sentenceToWords(
         props.vocabulary,
         props.lamma,
         e.target.value,
      );
      if (result.words) {
         setWords(result.words);
         showTips();
      } else {
         setWords([]);
         showTips(`未找到, ${result.word!}`, false);
      }
   };
   const handlePlayClick = () => {
      if (sentence()) {
         const utterance = new SpeechSynthesisUtterance(sentence());
         speechSynthesis.speak(utterance);
      }
   };
   const handleTransClick = async () => {
      const t = await srv.postTrans(sentence());
      if (t) setTrans(t);
      else showTips("翻译失败");
   };
   const handleAddClick = async () => {
      await mem.addSentence(sentence(), trans());
      showTips("添加成功!");
   };
   return (
      <Dialog class="p-2 flex flex-col gap-2" title="句子">
         <textarea
            name="sentence"
            class="grow"
            value={sentence()}
            onInput={handleSentenceOnInput}
         />
         <textarea
            name="trans"
            class="grow"
            value={trans()}
            onInput={(e) => setTrans(e.target.value)}
         />
         <div class="flex gap-2 pb-3 justify-end">
            <Button class="w-24 button btn-normal" onClick={() => go()}>
               取消
            </Button>
            <Button class="w-24 button btn-normal" onClick={handlePlayClick}>
               播放
            </Button>
            <Button class="w-24 button btn-normal" onClick={handleTransClick}>
               翻译
            </Button>
            <Button
               class="w-24 button btn-prime"
               disabled={!words().length || !trans()}
               onClick={handleAddClick}
            >
               添加
            </Button>
         </div>
      </Dialog>
   );
};
