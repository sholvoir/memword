import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface ITextAreaInputProps extends JSX.HTMLAttributes<HTMLTextAreaElement>{
    binding: Signal<string|undefined>
}
export default (props: ITextAreaInputProps) => {
    const { binding, value, class: className, ...rest} = props;
    const handleInput = (e: JSX.TargetedInputEvent<HTMLTextAreaElement>) =>
        binding.value = (e.target as HTMLTextAreaElement).value;
    return <textarea {...rest} value={binding.value} onInput={handleInput}
        class={`px-2 rounded border border-gray-500 [outline:none] disabled:opacity-50 ${className ?? ''}`}/>;
}