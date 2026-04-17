import Button from "@sholvoir/solid-components/button-ripple";
import TInput from "@sholvoir/solid-components/input-text";
import type {
   TextAreaInputTargeted,
   TextAreaTargeted,
} from "@sholvoir/solid-components/targeted";
import { type Accessor, createSignal, type Setter } from "solid-js";
import type { IItem } from "../lib/iitem.ts";
import { sentenceToWords } from "../lib/isentence.ts";
import * as mem from "../lib/mem.ts";
import * as srv from "../lib/server.ts";
import Dialog from "./dialog.tsx";
import { useG } from "./g-provider.tsx";

export default (props: {
   lamma: Record<string, string>;
   sentence: string;
   setCItem: Setter<IItem | undefined>;
   setPhaseAnswer: Setter<boolean>;
   setSentence: Setter<string>;
   setSprint: Setter<number>;
   setTrans: Setter<string>;
   setWord: Setter<string>;
   trans: string;
   vocabulary: Set<string>;
   word: Accessor<string>;
}) => {
   const [words, setWords] = createSignal<string[]>([]);
   const { go, showTips } = useG()!;
   const handleSentenceOnInput = (e: InputEvent & TextAreaInputTargeted) => {
      props.setSentence(e.target.value);
      props.setWord("");
      props.setTrans("");
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
   const handleSentenceSelect = (e: Event & TextAreaTargeted) => {
      const element = e.currentTarget;
      const w = element.value.slice(
         element.selectionStart,
         element.selectionEnd,
      );
      const result = sentenceToWords(props.vocabulary, props.lamma, w);
      if (result.words?.length) props.setWord(result.words[0]);
   };
   const handleDictClick = async () => {
      const text = props.word().trim();
      if (!text) return;
      const item = await mem.search(text);
      if (!item) return showTips("Not Found!");
      props.setCItem(item);
      props.setPhaseAnswer(true);
      props.setSprint(-1);
      go("#study");
   };
   const handlePlayClick = () => {
      if (props.sentence) {
         const utterance = new SpeechSynthesisUtterance(props.sentence);
         speechSynthesis.speak(utterance);
      }
   };
   const handleTransClick = async () => {
      const t = await srv.postTrans(props.sentence);
      if (t) props.setTrans(t);
      else showTips("翻译失败");
   };
   const handleAddClick = async () => {
      await mem.addSentence(props.sentence.trim(), props.trans);
      props.setSentence("");
      props.setWord("");
      props.setTrans("");
      setWords([]);
      showTips("添加成功!");
   };
   return (
      <Dialog class="p-2 flex flex-col gap-2 text-lg" title="翻译">
         <TInput
            autoCapitalize="none"
            type="search"
            name="word"
            placeholder="word"
            binding={[props.word, props.setWord]}
            onChange={handleDictClick}
            options={props.vocabulary}
         />
         <textarea
            name="sentence"
            class="grow"
            value={props.sentence}
            onInput={handleSentenceOnInput}
            onSelect={handleSentenceSelect}
         />
         <textarea
            name="trans"
            class="grow"
            value={props.trans}
            onInput={(e) => props.setTrans(e.target.value)}
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
               disabled={!words().length || !props.trans}
               onClick={handleAddClick}
            >
               添加
            </Button>
         </div>
      </Dialog>
   );
};
