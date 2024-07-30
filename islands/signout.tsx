import { useSignal } from "@preact/signals";
import { showDialog, closeDialog, signals } from '../lib/mem.ts';
import { logout } from '../lib/mem.ts';
import Checkbox from './checkbox.tsx';
import NButton from './button-normal.tsx';
import PButton from './button-prime.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const cleanUser = useSignal(false);
    const cleanDict = useSignal(false);
    const handleSignoutClick = () => {
        signals.user.value = '';
        closeDialog();
        showDialog({dial: 'about'});
        logout(cleanUser.value, cleanDict.value);
    };
    
    return <Dialog title="登出">
        <div class="p-2 h-full w-64 mx-auto flex flex-col gap-4">
            <div class="flex flex-col">
                <Checkbox name="cleanUser" label="删除我的学习记录" binding={cleanUser} />
                <Checkbox name="cleanDict" label="删除缓存的词典" binding={cleanDict} />
            </div>
            <div class="flex gap-2">
                <NButton class="grow" onClick={closeDialog}>取消</NButton>
                <PButton class="grow" onClick={handleSignoutClick}>登出</PButton>
            </div>
        </div>
    </Dialog>;
}