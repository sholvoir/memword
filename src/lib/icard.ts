import { TASK_MAX_NEXT } from "./common.ts";
import type { ITrace } from "./itrace.ts";

export interface ICard extends ITrace {
   page?: string;
}

export const ST_MAX_LEVEL = 10;

export const extractWords = (
   vocabulary: Set<string>,
   lamma: Record<string, string>,
   sentence: string,
): {
   word?: string;
   words?: Array<string>;
} => {
   const words = [];
   const array = sentence
      .replaceAll(/<r>.+?<\/r>/g, "")
      .replaceAll(/<\/?.+?>/g, "")
      .replace(/\.$/, "")
      .replaceAll(/[^A-Za-z0-9 '.\n-]/g, "")
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

export const newCard = (page: string): ICard => {
   const time = Date.now();
   return {
      last: time,
      next: time,
      level: 1,
      page,
   };
};

export const studyCard = <T extends ITrace>(card: T, know?: boolean): T => {
   let level = know ? ++card.level : (card.level = 1);
   if (card.level > ST_MAX_LEVEL) card.level = level = ST_MAX_LEVEL;
   const now = Date.now();
   card.last = now;
   card.next =
      level >= ST_MAX_LEVEL
         ? TASK_MAX_NEXT
         : now + Math.round(134848 * level ** 3 * 1.5 ** level);
   return card;
};
