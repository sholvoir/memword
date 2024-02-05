import { JSX } from "preact";
import SButton from './button-anti-shake.tsx';
import IconChevronLeft from "tabler_icons/chevron-left.tsx";

export interface IDialogProps {
    onCancel: () => void;
    showTips?: (content: string) => void;
};
export default ({title, onCancel, children}: IDialogProps & JSX.HTMLAttributes<HTMLDivElement>) => {
    return <div class="fixed inset-0 bg-slate-200 dark:bg-slate-800 flex flex-col">
        <div class="p-2 flex justify-between bg-slate-300 dark:bg-slate-900">
            <SButton onClick={onCancel}><IconChevronLeft class="w-6 h-6"/></SButton>
            <div class="font-bold">{title}</div><div class="w-6 h-6"></div>
        </div>
        <div class="grow overflow-y-auto">{children}</div>
    </div>
}