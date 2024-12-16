import { closeDialog, signals } from "../lib/signals.ts";
import { logout } from '../lib/mem.ts';
import Button from '@sholvoir/components/islands/button-ripple.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const handleSignoutClick = () => {
        signals.user.value = '';
        closeDialog();
        logout();
    };
    return <Dialog title="登出">
        <div class="p-2 h-full w-64 mx-auto flex flex-col gap-4">
            <div class="flex gap-2">
                <Button class="button btn-normal grow" onClick={closeDialog}>取消</Button>
                <Button class="button btn-prime grow" onClick={handleSignoutClick}>登出</Button>
            </div>
        </div>
    </Dialog>;
}