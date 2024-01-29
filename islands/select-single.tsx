// deno-lint-ignore-file no-explicit-any
import { Signal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";

interface ISlectProps {
    options: Array<{value: string|number, label: string}>;
    binding: Signal<string|number>;
    disabled?: boolean;
}
export default (props: ISlectProps & JSX.HTMLAttributes<HTMLFieldSetElement>) => {
    const {options, binding, title, disabled, class: className, ...rest} = props;
    const handleOptionClick = (e: Event) => {
        binding.value = (e.currentTarget as HTMLDivElement).title as string|number;
    }
    return <fieldset class={`overflow-y-auto border border-solid border-gray-500 p-2 flex flex-col gap-1 aria-disabled:opacity-50 fill-slate-800 dark:fill-slate-300 dark:[scrollbar-color:#888_#0000] ${className ?? ''}`} aria-disabled={disabled} {...rest}>
        <legend>{title}</legend>
        {options.map(option =>
            <div class="flex gap-1 cursor-pointer items-center hover:bg-slate-300 dark:hover:bg-slate-700" title={option.value as any} onClick={handleOptionClick}>
                <div class="w-4 h-4">{option.value == binding.value && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>}</div>
                <div>{option.label}</div>
            </div>
        )}
    </fieldset>
}