import { Signal, useSignal } from "@preact/signals";
import { Loca } from './root.tsx';
import * as mem from '../lib/mem.ts';
import CInput from './input-checkbox.tsx';
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
    return <div class="h-full w-64 mx-auto grid grid-cols-1 gap-4 content-center">
        <CInput name="cleanUser" label="Delete My Study Record" binding={cleanUser} />
        <CInput name="cleanDict" label="Delete Dictionary Cache" binding={cleanDict} />
        <div class="flex gap-2">
            <PButton class="grow" onClick={handleCancelClick}>Cancel</PButton>
            <PButton class="grow" onClick={handleSignoutClick}>Logout</PButton>
        </div>
    </div>;
}