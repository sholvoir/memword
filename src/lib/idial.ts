export const DIALS = [
   "#home",
   "#help",
   "#about",
   "#issue",
   "#setting",
   "#book",
   "#search",
   "#study",
   "#signup",
   "#signin",
] as const;
export type TDial = (typeof DIALS)[number];
