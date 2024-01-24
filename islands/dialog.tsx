import { JSX } from "preact";
import SButton from './button-anti-shake.tsx';
import IconChevronLeft from "tabler_icons/chevron-left.tsx";

interface IDialogProps extends JSX.HTMLAttributes<HTMLDivElement> {
    onFinish: () => void;
};
export default ({title, onFinish, children}: IDialogProps) => {
    return <div class="fixed inset-0 bg-gray-100 flex flex-col [&>div]:p-2">
        <div class="flex justify-between bg-gray-800 text-white">
            <SButton onClick={onFinish}><IconChevronLeft class="w-6 h-6"/></SButton>
            <span class="font-bold">{title}</span><span></span>
        </div>
        <div class="overflow-y-auto">{children}</div>
    </div>
}