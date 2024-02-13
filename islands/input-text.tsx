import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface ITextInputProps extends JSX.HTMLAttributes<HTMLInputElement>{
    binding: Signal<string|number|undefined>;
    num?: boolean;
}
export default (props: ITextInputProps) => {
    const { type, num, binding, value, class: className, ...rest} = props;
    const handleInput = (e: Event) => {
        const text = (e.target as HTMLInputElement).value;
        const number = +text;
        if (!num) binding.value = text;
        else if (number) binding.value = number;
    }
    return <input type={type ?? 'text'} {...rest} value={binding.value} onInput={handleInput}
        class={`px-2 rounded border border-gray-500 [outline:none] disabled:opacity-50 ${className ?? ''}`}/>;
}