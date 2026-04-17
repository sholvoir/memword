import type { ISentence } from "#srv/lib/isentence.ts";
import type { ITrace } from "#srv/lib/itrace.ts";

export type { ISentence };

const ST_MAX_LEVEL = 10;
const TASK_MAX_NEXT = 2000000000000;

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
   for (let i = 0; i < array.length; i++) {
      const word = array[i].trim();
      if (!word) continue;
      if (/\d/.test(word)) continue;
      if (vocabulary.has(word)) {
         words.push(word);
         continue;
      }
      const lword = word.toLowerCase();
      if (i === 0 && vocabulary.has(lword)) {
         words.push(lword);
         continue;
      }
      const laword = lamma[word] || lamma[lword];
      if (laword && vocabulary.has(laword)) {
         words.push(laword);
         continue;
      }
      return { word };
   }
   return { words };
};

export const newSentence = (sentence: string, trans: string): ISentence => {
   const time = Date.now();
   return {
      sentence,
      trans,
      last: time,
      next: time,
      level: 1,
   };
};

export const studySentence = (st: ISentence, know?: boolean): ISentence => {
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

export const sentenceMergeTrace = (st: ISentence, trace: ITrace) => {
   st.last = trace.last;
   st.next = trace.next;
   st.level = trace.level;
   return st;
};
