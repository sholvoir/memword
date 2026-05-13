import type { ISentence } from "#srv/lib/isentence.ts";
import { TASK_MAX_NEXT } from "./common.ts";
import type { ITrace } from "./itrace.ts";

export type { ISentence };
export type IStItem = ISentence & ITrace;

export const ST_MAX_LEVEL = 10;

export const sentenceToWords = (
   vocabulary: Set<string>,
   lamma: Record<string, string>,
   sentence: string,
): {
   word?: string;
   words?: Array<string>;
} => {
   const words = [];
   const array = sentence
      .replace(/\.$/, "")
      .replaceAll(/[^A-Za-z0-9 '.-]/g, "")
      .split(/\s+/);
   for (let word of array)
      if ((word = word.trim())) {
         if (/\d/.test(word)) continue;
         if (vocabulary.has(word)) {
            words.push(word);
            continue;
         }
         const lword = word.toLowerCase();
         if (vocabulary.has(lword)) {
            words.push(lword);
            continue;
         }
         const laword = lamma[word] || lamma[lword];
         if (laword && vocabulary.has(laword)) {
            words.push(laword);
            continue;
         }
         const rpword = word.replace(/'s$/, "");
         if (vocabulary.has(rpword)) {
            words.push(rpword);
            continue;
         }
         const lrpword = lword.replace(/'s$/, "");
         if (vocabulary.has(lrpword)) {
            words.push(lrpword);
            continue;
         }
         return { word };
      }
   return { words };
};

export const newSti = (sentence: string, trans: string): IStItem => {
   const time = Date.now();
   return {
      sentence,
      trans,
      last: time,
      next: time,
      level: 1,
   };
};

export const studySti = (st: IStItem, know?: boolean): IStItem => {
   let level = know ? ++st.level : (st.level = 1);
   if (st.level > ST_MAX_LEVEL) st.level = level = ST_MAX_LEVEL;
   const now = Date.now();
   st.last = now;
   st.next =
      level >= ST_MAX_LEVEL
         ? TASK_MAX_NEXT
         : now + Math.round(134848 * level ** 3 * 1.5 ** level);
   return st;
};

export const stiMergeSentence = (st: IStItem, sentence: ISentence) => {
   st.sentence = sentence.sentence;
   st.trans = sentence.trans;
   return st;
};
