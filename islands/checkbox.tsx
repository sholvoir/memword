// deno-lint-ignore-file no-explicit-any
import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface ICheckboxProps {
    binding: Signal<boolean>;
    label?: string;
    disabled?: boolean;
}
export default (props: ICheckboxProps & JSX.HTMLAttributes<HTMLDivElement>) => {
    const { label, binding, disabled, class: className, onChange, ...rest} = props;
    const handleClick = (e: any) => { binding.value = !binding.value; onChange?.call(undefined, e) }
    return <div class={`w-fit flex gap-2 aria-disabled:opacity-50 fill-black dark:fill-white items-center ${className ?? ''}`} aria-disabled={disabled} onClick={handleClick} {...rest}>
        <div class="w-4 h-4 border rounded border-gray-500">{binding.value?<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>:''}</div><div>{label}</div>
    </div>
}