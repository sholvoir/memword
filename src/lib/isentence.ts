import type { ISentence } from "#srv/lib/isentence.ts";

export type { ISentence };

const ST_MAX_LEVEL = 10;
const TASK_MAX_NEXT = 2000000000000;

export const sentenceToWords = (
   vocabulary: Set<string>,
   sentence: string,
): {
   word?: string;
   words?: Array<string>;
} => {
   const words = [];
   const array = sentence.replace(/[^A-Za-z '-]/g, "").split(/\s+/);
   for (let i = 0; i < array.length; i++) {
      const word = array[i].trim();
      if (!word) continue;
      if (vocabulary.has(word)) {
         words.push(word);
         continue;
      }
      if (i !== 0) return { word };
      const lword = word.toLowerCase();
      if (vocabulary.has(lword)) {
         words.push(word);
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

export const studySentence = (task: ISentence, know?: boolean): ISentence => {
   let level = know ? ++task.level : (task.level = 1);
   if (task.level > ST_MAX_LEVEL) task.level = level = ST_MAX_LEVEL;
   const now = Date.now();
   task.last = now;
   task.next =
      level >= ST_MAX_LEVEL
         ? TASK_MAX_NEXT
         : now + Math.round(134848 * level ** 3 * 1.5 ** level);
   return task;
};
