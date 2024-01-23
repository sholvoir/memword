import { Signal, useSignal } from "@preact/signals";
import { Loca } from './root.tsx';
import * as mem from '../lib/mem.ts';
import CInput from './input-checkbox.tsx';
import NButton from './button-normal.tsx';
import PButton from './button-prime.tsx';

interface ISignoutProps {
    user: Signal<string|undefined>,
    loca: Signal<Loca>;
};
export default ({user, loca}: ISignoutProps) => {
    const cleanUser = useSignal(false);
    const cleanDict = useSignal(false);
    const handleCancelClick = () => loca.value = 'stats';
    const handleSignoutClick = async () => {
        const u = user.value;
        user.value = undefined;
        loca.value = 'about';
        await mem.removeAuth(cleanUser.value ? u : undefined, cleanDict.value);
    };
    return <div class="h-full w-64 mx-auto flex flex-col gap-4 justify-center">
        <div class="flex flex-col">
            <CInput name="cleanUser" label="删除我的学习记录" binding={cleanUser} />
            <CInput name="cleanDict" label="删除缓存的词典" binding={cleanDict} />
        </div>
        <div class="flex gap-2">
            <NButton class="grow" onClick={handleCancelClick}>取消</NButton>
            <PButton class="grow" onClick={handleSignoutClick}>登出</PButton>
        </div>
    </div>;
}