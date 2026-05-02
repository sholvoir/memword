import Button from "@sholvoir/solid-components/button-ripple";
import TInput from "@sholvoir/solid-components/input-text";
import type {
   TextAreaInputTargeted,
   TextAreaTargeted,
} from "@sholvoir/solid-components/targeted";
import { createSignal } from "solid-js";
import { sentenceToWords } from "../lib/isentence.ts";
import * as mem from "../lib/mem.ts";
import { speak } from "../lib/speech.ts";
import Dialog from "./dialog.tsx";
import { go, showTips } from "./provider-g.ts";
import { setSearch } from "./provider-study.ts";
import { lemma, vocabulary } from "./provider-user.ts";

const [word, setWord] = createSignal("");
const [trans, setTrans] = createSignal("");
const [sentence, setSentence] = createSignal("");
const [words, setWords] = createSignal<string[]>([]);

export default () => {
   const handleSentenceOnInput = (e: InputEvent & TextAreaInputTargeted) => {
      setSentence(e.target.value);
      setWord("");
      setTrans("");
      const result = sentenceToWords(vocabulary(), lemma(), e.target.value);
      if (result.words) {
         setWords(result.words);
         showTips();
      } else {
         setWords([]);
         showTips(`未找到 "${result.word!}"`, false);
      }
   };
   const handleSentenceSelect = (e: Event & TextAreaTargeted) => {
      const element = e.currentTarget;
      const w = element.value.slice(
         element.selectionStart,
         element.selectionEnd,
      );
      const result = sentenceToWords(vocabulary(), lemma(), w);
      if (result.words?.length) setWord(result.words[0]);
   };
   const handleDictClick = async () => {
      const text = word().trim();
      if (!text) return;
      setSearch(text);
      go("#study");
   };
   const handleTransClick = async () => {
      const t = await mem.baiduTranslate(sentence());
      if (t) setTrans(t);
      else showTips("翻译失败");
   };
   const handleAddClick = async () => {
      await mem.addSentence(sentence().trim(), trans());
      setSentence("");
      setWord("");
      setTrans("");
      setWords([]);
      showTips("添加成功!");
   };
   return (
      <Dialog
         class="p-2 flex flex-col gap-2 text-lg"
         title="翻译"
         bottom={
            <div class="px-2 pt-2 pb-5 flex gap-2">
               <Button
                  class="flex-auto button btn-normal"
                  onClick={() => speak(sentence())}
               >
                  播放
               </Button>
               <Button
                  class="flex-auto button btn-normal"
                  onClick={handleTransClick}
               >
                  翻译
               </Button>
               <Button
                  class="flex-auto button btn-prime"
                  disabled={!words().length || !trans()}
                  onClick={handleAddClick}
               >
                  添加
               </Button>
               <Button class="flex-auto button btn-normal" onClick={() => go()}>
                  取消
               </Button>
            </div>
         }
      >
         <div class="flex gap-2">
            <TInput
               autoCapitalize="none"
               binding={[word, setWord]}
               class="flex-auto"
               name="word"
               onChange={handleDictClick}
               options={vocabulary()}
               placeholder="word"
               type="search"
            />
            <Button class="button btn-normal" onClick={handleDictClick}>
               查找
            </Button>
         </div>
         <textarea
            class="grow"
            name="sentence"
            onInput={handleSentenceOnInput}
            onSelect={handleSentenceSelect}
            placeholder="sentence"
            value={sentence()}
         />
         <textarea
            class="grow"
            name="trans"
            onInput={(e) => setTrans(e.target.value)}
            placeholder="trans"
            value={trans()}
         />
      </Dialog>
   );
};
