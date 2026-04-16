import Button from "@sholvoir/solid-components/button-ripple";
import TInput from "@sholvoir/solid-components/input-text";
import type { TextAreaTargeted } from "@sholvoir/solid-components/targeted";
import { createSignal, type Setter } from "solid-js";
import type { IItem } from "../lib/iitem.ts";
import { sentenceToWords } from "../lib/isentence.ts";
import * as mem from "../lib/mem.ts";
import * as srv from "../lib/server.ts";
import Dialog from "./dialog.tsx";
import { useG } from "./g-provider.tsx";

export default (props: {
   lamma: Record<string, string>;
   setCItem: Setter<IItem | undefined>;
   setPhaseAnswer: Setter<boolean>;
   setSprint: Setter<number>;
   vocabulary: Set<string>;
}) => {
   const [word, setWord] = createSignal("");
   const [sentence, setSentence] = createSignal("");
   const [trans, setTrans] = createSignal<string>("");
   const [words, setWords] = createSignal<string[]>([]);
   const { go, showTips } = useG()!;
   const handleSentenceOnInput = (e: InputEvent & TextAreaTargeted) => {
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
   const handleSentenceSelect = (
      e: Event & {
         currentTarget: HTMLTextAreaElement;
         target: Element;
      },
   ) => {
      const element = e.currentTarget;
      const w = element.value.slice(
         element.selectionStart,
         element.selectionStart,
      );
      const result = sentenceToWords(props.vocabulary, props.lamma, w);
      if (result.words) setWord(result.words[0]);
   };
   const handleDictClick = async () => {
      const text = word().trim();
      if (!text) return;
      const item = await mem.search(text);
      if (!item) return showTips("Not Found!");
      props.setCItem(item);
      props.setPhaseAnswer(true);
      props.setSprint(-1);
      go("#study");
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
      <Dialog class="p-2 flex flex-col gap-2 text-lg" title="翻译">
         <TInput
            autoCapitalize="none"
            type="search"
            name="word"
            placeholder="word"
            class="m-2 w-[calc(100%-16px)]"
            binding={[word, setWord]}
            onChange={handleDictClick}
            options={props.vocabulary}
         />
         <textarea
            name="sentence"
            class="grow"
            value={sentence()}
            onInput={handleSentenceOnInput}
            onSelect={handleSentenceSelect}
         />
         <textarea
            name="trans"
            class="grow"
            value={trans()}
            onInput={(e) => setTrans(e.target.value)}
         />
         <div class="flex gap-2 pb-3 justify-end">
            <Button class="w-16 button btn-normal" onClick={() => go()}>
               取消
            </Button>
            <Button class="w-16 button btn-normal" onClick={handleDictClick}>
               辞典
            </Button>
            <Button class="w-16 button btn-normal" onClick={handlePlayClick}>
               播放
            </Button>
            <Button class="w-16 button btn-normal" onClick={handleTransClick}>
               翻译
            </Button>
            <Button
               class="w-16 button btn-prime"
               disabled={!words().length || !trans()}
               onClick={handleAddClick}
            >
               添加
            </Button>
         </div>
      </Dialog>
   );
};
