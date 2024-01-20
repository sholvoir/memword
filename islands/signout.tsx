import { Signal, useSignal } from "@preact/signals";
import { Loca } from './root.tsx';
import * as mem from '../lib/mem.ts';
import CInput from './input-checkbox.tsx';
import PButton from './button-prime.tsx';

interface ISignoutProps {
    isLogin: Signal<boolean>,
    loca: Signal<Loca>;
};
export default ({isLogin, loca}: ISignoutProps) => {
    const cleanup = useSignal(false);
    const handleClickSignout = async () => {
        isLogin.value = false;
        loca.value = 'about';
        await mem.removeAuth(cleanup.value);
    }
    return <div class="h-full w-64 mx-auto grid grid-cols-1 gap-4 content-center">
        <CInput name="cleanup" label="Clean My Study Record" binding={cleanup} />
        <PButton class="w-full block" onClick={handleClickSignout}>Logout</PButton>
    </div>;
}