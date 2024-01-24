import { useSignal } from "@preact/signals";
import CInput from './input-checkbox.tsx';
import NButton from './button-normal.tsx';
import PButton from './button-prime.tsx';
import Dialog from './dialog.tsx';

interface ISignoutProps {
    onFinish: () => void;
    handleSignoutClick: (cleanUser: boolean, cleanDict: boolean) => void;
};
export default ({onFinish, handleSignoutClick}: ISignoutProps) => {
    const cleanUser = useSignal(false);
    const cleanDict = useSignal(false);
    
    return <Dialog title="登出" onFinish={onFinish}>
        <div class="h-full w-64 mx-auto flex flex-col gap-4">
            <div class="flex flex-col">
                <CInput name="cleanUser" label="删除我的学习记录" binding={cleanUser} />
                <CInput name="cleanDict" label="删除缓存的词典" binding={cleanDict} />
            </div>
            <div class="flex gap-2">
                <NButton class="grow" onClick={onFinish}>取消</NButton>
                <PButton class="grow" onClick={() => handleSignoutClick(cleanUser.value, cleanDict.value)}>登出</PButton>
            </div>
        </div>
    </Dialog>;
}