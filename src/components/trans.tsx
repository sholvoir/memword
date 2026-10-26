import Button from "@sholvoir/solid-components/button-ripple";
import TInput from "@sholvoir/solid-components/input-text";
import type {
   TextAreaInputTargeted,
   TextAreaTargeted,
} from "@sholvoir/solid-components/targeted";
import { createSignal } from "solid-js";
import { extractWords, newCard } from "../lib/icard.ts";
import * as mem from "../lib/mem.ts";
import { speak } from "../lib/speech.ts";
import Dialog from "./dialog.tsx";
import { card, setCard } from "./provider-card.ts";
import { go, showTips } from "./provider-g.ts";
import { goStudy } from "./provider-study.ts";
import { lemma, vocabulary } from "./provider-user.ts";

const buttonClass = "flex-auto button btn-normal";

const [word, setWord] = createSignal("");
const [words, setWords] = createSignal<string[]>([]);

export default () => {
   let ta!: HTMLTextAreaElement;
   const taSelect = (start: number, end: number) => {
      ta.focus();
      ta.setSelectionRange(start, end);
   };
   const handleRemoveClick = () => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      setCard(
         "page",
         value.substring(0, selectionStart - 1) +
            value.substring(selectionStart, selectionEnd) +
            value.substring(selectionEnd + 1),
      );
      taSelect(selectionStart - 1, selectionEnd - 1);
   };
   const handleParenthesesClick = (patenheses: "()" | "[]" | '""') => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      setCard(
         "page",
         value.substring(0, selectionStart) +
            patenheses[0] +
            value.substring(selectionStart, selectionEnd) +
            patenheses[1] +
            value.substring(selectionEnd),
      );
      taSelect(selectionStart + 1, selectionEnd + 1);
   };
   const handleBIClick = (tag: "o" | "b" | "i" | "r") => {
      const value = ta.value;
      const selectionStart = ta.selectionStart;
      const selectionEnd = ta.selectionEnd;
      setCard(
         "page",
         value.substring(0, selectionStart) +
            `<${tag}>` +
            value.substring(selectionStart, selectionEnd) +
            `</${tag}>` +
            value.substring(selectionEnd),
      );
      const l = tag.length + 2;
      taSelect(selectionStart + l, selectionEnd + l);
   };
   const handleReverseClick = () => {
      const npage: Array<string> = [];
      for (const p of ta.value.split("\n")) {
         if (p.endsWith("</r>")) npage.push(p);
         else npage.push(`${p} <r></r>`);
      }
      setCard("page", npage.join("\n"));
   };
   const handlePageKeyDown = (e: KeyboardEvent & TextAreaTargeted) => {
      if (e.key === "Tab") {
         e.preventDefault();
         const value = ta.value;
         const selectionStart = ta.selectionStart;
         const selectionEnd = ta.selectionEnd;
         setCard(
            "page",
            `${value.substring(0, selectionStart)}\t${value.substring(selectionEnd)}`,
         );
         taSelect(selectionStart + 1, selectionStart + 1);
      }
   };
   const handlePageInput = (e: InputEvent & TextAreaInputTargeted) => {
      setCard("page", e.target.value);
      setWord("");
      const result = extractWords(vocabulary(), lemma(), e.target.value);
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
      const result = extractWords(vocabulary(), lemma(), w);
      if (result.words?.length) setWord(result.words[0]);
   };
   const handleDictClick = async () => {
      const text = word().trim();
      if (!text) return;
      goStudy(undefined, undefined, text);
   };
   const handleTransClick = async () => {
      const npage: Array<string> = [];
      for (const p of ta.value.split("\n")) {
         const t = await mem.baiduTranslate(p);
         if (t) npage.push(`${p}\n<r>${t}</r>`);
         else npage.push(p);
      }
      setCard("page", npage.join("\n"));
   };
   const handleAddUpdateClick = async () => {
      if (card.id) {
         const { id, ...rest } = card;
         if (await mem.addCard(rest)) {
            await mem.deleteCard([id]);
            mem.deleteLocalCard(id);
         }
         setCard(newCard(""));
         showTips("更新成功!");
      } else {
         await mem.addCard(newCard(card.page ?? ""));
         setCard("page", "");
         showTips("添加成功!");
      }
      setWord("");
      setWords([]);
   };
   return (
      <Dialog
         class="p-2 flex flex-col gap-2 text-lg"
         title="翻译"
         bottom={
            <div class="px-2 pt-2 pb-5 flex gap-2">
               <Button
                  class="flex-auto button btn-normal"
                  onClick={() => speak(card.page)}
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
                  disabled={!words().length}
                  onClick={handleAddUpdateClick}
               >
                  {card.id ? "更新" : "添加"}
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
               class="flex-auto"
               name="word"
               onChange={handleDictClick}
               onInput={setWord}
               options={vocabulary()}
               placeholder="word"
               type="search"
               value={word()}
            />
            <Button class="button btn-normal" onClick={handleDictClick}>
               查找
            </Button>
         </div>
         <div class="flex gap-2">
            <Button class={buttonClass} onClick={handleRemoveClick}>
               ~
            </Button>
            <Button
               class={buttonClass}
               onClick={() => handleParenthesesClick('""')}
            >
               &quot;&quot;
            </Button>
            <Button
               class={buttonClass}
               onClick={() => handleParenthesesClick("()")}
            >
               ()
            </Button>
            <Button
               class={buttonClass}
               onClick={() => handleParenthesesClick("[]")}
            >
               []
            </Button>
            <Button class={buttonClass} onClick={() => handleBIClick("o")}>
               O
            </Button>
            <Button class={buttonClass} onClick={() => handleBIClick("b")}>
               B
            </Button>
            <Button class={buttonClass} onClick={() => handleBIClick("i")}>
               I
            </Button>
            <Button class={buttonClass} onClick={() => handleBIClick("r")}>
               R
            </Button>
            <Button class={buttonClass} onClick={handleReverseClick}>
               Reverse
            </Button>
         </div>
         <textarea
            class="grow"
            name="sentence"
            onKeyDown={handlePageKeyDown}
            onInput={handlePageInput}
            onSelect={handleSentenceSelect}
            placeholder="sentence"
            ref={ta}
            value={card.page}
         />
      </Dialog>
   );
};
