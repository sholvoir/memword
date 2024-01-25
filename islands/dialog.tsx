import { JSX } from "preact";
import SButton from './button-anti-shake.tsx';
import IconChevronLeft from "tabler_icons/chevron-left.tsx";

export interface IDialogProps {
    onCancel: () => void;
    showTips?: (content: string) => void;
};
export default ({title, onCancel, children}: IDialogProps & JSX.HTMLAttributes<HTMLDivElement>) => {
    return <div class="fixed inset-0 bg-gray-100 flex flex-col [&>div]:p-2">
        <div class="flex justify-between bg-gray-800 text-white">
            <SButton onClick={onCancel}><IconChevronLeft class="w-6 h-6"/></SButton>
            <span class="font-bold">{title}</span><span></span>
        </div>
        <div class="overflow-y-auto">{children}</div>
    </div>
}