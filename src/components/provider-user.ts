import { createSignal } from "solid-js";
import { defaultSetting, type ISetting } from "#srv/lib/isetting.ts";
import { initStats } from "../lib/istat.ts";
import * as mem from "../lib/mem.ts";

const [stats, setStats] = createSignal(initStats());
const [lemma, setLemma] = createSignal<Record<string, string>>({});
const [setting, setSetting] = createSignal(defaultSetting());
const [vocabulary, setVocabulary] = createSignal(new Set<string>());

export { lemma, stats, setting, vocabulary };
export const totalStats = async () =>
   setStats(await mem.totalStats(setting().books));

export const saveSetting = async (nsetting: ISetting) => {
   const s = setSetting(nsetting);
   mem.setLocalSetting(s);
   mem.syncSetting(s);
};

const initSetting = async () => {
   const lSetting = await mem.getLocalSetting();
   if (lSetting && lSetting.version > setting().version) setSetting(lSetting);
   else mem.setLocalSetting(setting());
};

const syncSetting = async () => {
   const sSetting = await mem.syncSetting(setting());
   if (sSetting && sSetting.version > setting().version)
      mem.setLocalSetting(setSetting(sSetting));
};

export const initLemma = async () => {
   const lm = await mem.getLocalLemma();
   if (lm) setLemma(lm[0]);
   (async () => {
      const sChecksum = await mem.getLemmaChecksum();
      if (!sChecksum || sChecksum === lm?.[1]) return;
      const l = await mem.getLemma();
      if (l) mem.setLocalLemma([setLemma(l), sChecksum]);
   })();
};

export const initVocabulary = async () => {
   const vocab = await mem.getLocalVocabulary();
   if (vocab) setVocabulary(vocab[0]);
   (async () => {
      const sChecksum = await mem.getVocabularyChecksum();
      if (!sChecksum || sChecksum === vocab?.[1]) return;
      const sVocabulary = await mem.getVocabulary();
      if (!sVocabulary) return;
      const { words, checksum } = sVocabulary;
      const nvocab = new Set<string>();
      for (let word of words) if ((word = word.trim())) nvocab.add(word);
      mem.setLocalVocabulary([setVocabulary(nvocab), checksum]);
   })();
};

export const syncBooks = async () => {
   const books = (await mem.getBooks()) ?? [];
   const checksums = (await mem.getCommonBooks()) ?? {};
   for (const [bname, { disc, checksum }] of Object.entries(checksums))
      books.push({
         bid: `common/${bname}`,
         disc,
         checksum,
         public: true,
      });
   if (books.length) {
      const deleted = await mem.syncBooks(books);
      if (setting().books.length) {
         const books = setting().books.filter((bid) => !deleted.has(bid));
         if (books.length !== setting().books.length) {
            const se = setSetting((s) => ({
               ...s,
               books,
               version: Date.now(),
            }));
            mem.setLocalSetting(se);
            mem.syncSetting(se);
         }
      }
   }
};

export const afterLogin = async () => {
   await initSetting();
   await syncBooks();
   await totalStats();
   await syncSetting();
   await mem.syncTasks();
   await mem.syncStis();
   totalStats();
   initLemma();
   initVocabulary();
   mem.submitIssues();
};
