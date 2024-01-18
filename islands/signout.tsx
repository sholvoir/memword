import { Signal, useSignal } from "@preact/signals";
import { Loca } from './root.tsx';
import * as mem from '../lib/mem.ts';

interface ISignoutProps {
    isLogin: Signal<boolean>,
    loca: Signal<Loca>;
};
export default ({isLogin, loca}: ISignoutProps) => {
    const cleanup = useSignal(false);
    const handleCleanupChange = ({ target }: Event) => {
        cleanup.value = (target as HTMLInputElement).checked;
    };
    const handleClickSignout = async () => {
        isLogin.value = false;
        loca.value = 'about';
        await mem.removeAuth(cleanup.value);
    }
    return <div class="h-full w-64 mx-auto grid grid-cols-1 gap-4 content-center">
        <div class="flex gap-2">
            <input type="checkbox" name="cleanup" checked={cleanup.value} onChange={handleCleanupChange}/>
            <label for="cleanup">Clean My Study Record</label>
        </div>
        <div>
            <button class="w-full p-2 rounded bg-indigo-700 text-white active:bg-indigo-950"
                onClick={handleClickSignout}>Logout</button>
        </div>
    </div>;
}