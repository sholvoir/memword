import { dict } from './dict.ts';
import { trans } from './baibu.ts';
import { getSound } from './dictionary.ts';

export async function getDict(word: string) {
    const value = await dict.get(word);
    if (!value) return null;
    if (value.trans && value.sound) return value;
    if (!value.trans) {
        value.trans = await trans(word);
    }
    if (!value.sound) {
        const sound = await getSound(word);
        if (sound) {
            value.sound = sound.audio;
            value.phonetics = sound.text;
        }
    }
    dict.patch(word, value);
    return value;
}