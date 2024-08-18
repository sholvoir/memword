import { JSX } from "preact";
import { closeDialog } from '../lib/mem.ts'
import SButton from '@sholvoir/components/islands/button-base.tsx';
import IconChevronLeft from "@preact-icons/tb/TbChevronLeft";
import IconDots from "@preact-icons/tb/TbDots";

interface IDialogProps {
    noback?: boolean;
    onCancel?: () => void;
    onMenuClick?: () => void;
}
export default ({title, children, onCancel, noback, onMenuClick }: IDialogProps & JSX.HTMLAttributes<HTMLDivElement>) => {
    return <div class="fixed inset-0 flex flex-col">
        <div class="title shrink-0 px-2 flex justify-between items-center">
            {noback ? <div class="w-6 h-6"></div> :
                <SButton class="[app-region:no-drag]" onClick={onCancel ?? closeDialog}><IconChevronLeft class="w-6 h-6"/></SButton>}
            <div class="font-bold [app-region:drag]">{title}</div>
            {!onMenuClick ? <div class="w-6 h-6"></div> :
                <SButton class="[app-region:no-drag]" onClick={onMenuClick}><IconDots class="w-6 h-6"/></SButton>}
        </div>
        <div class="body grow overflow-y-auto ">{children}</div>
    </div>
}