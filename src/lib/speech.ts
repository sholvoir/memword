const speechs = new Map<string, SpeechSynthesisUtterance>();
const getUrrerance = (text: string) => {
   const utterance = new SpeechSynthesisUtterance(text);
   utterance.lang = "en-US";
   utterance.rate = 0.8;
   utterance.voice = speechSynthesis
      .getVoices()
      .find((voice) => voice.name === "Google US English")!;
   speechs.set(text, utterance);
   return utterance;
};

export const speak = (text?: string) =>
   text && speechSynthesis.speak(speechs.get(text) ?? getUrrerance(text));
