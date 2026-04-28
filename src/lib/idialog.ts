export const DIALOGS = [
   "#about",
   "#book",
   "#empty",
   "#help",
   "#home",
   "#issue",
   "#sentence",
   "#setting",
   "#signin",
   "#signup",
   "#study",
   "#trans",
] as const;
export type TDialog = (typeof DIALOGS)[number];
