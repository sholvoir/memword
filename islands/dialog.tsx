import { JSX } from "preact";
import SButton from './button-anti-shake.tsx';
import IconChevronLeft from "tabler_icons/chevron-left.tsx";

export interface IDialogProps {
    onCancel: () => void;
    showTips?: (content: string) => void;
};
export default ({title, onCancel, children}: IDialogProps & JSX.HTMLAttributes<HTMLDivElement>) => {
    return <div class="fixed inset-0 bg-slate-200 dark:bg-slate-800 flex flex-col">
        <div class="px-2 w-[env(titlebar-area-width,100%)] ml-[env(titlebar-area-x,0)] h-[env(titlebar-area-height,38px)] flex justify-between items-center bg-slate-300 dark:bg-slate-900">
            <SButton class="[app-region:no-drag]" onClick={onCancel}><IconChevronLeft class="w-6 h-6"/></SButton>
            <div class="font-bold [app-region:drag]">{title}</div><div class="w-6 h-6"></div>
        </div>
        <div class="grow overflow-y-auto">{children}</div>
    </div>
}