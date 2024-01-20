import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface ITextAreaInputProps extends JSX.HTMLAttributes<HTMLTextAreaElement>{
    binding: Signal<string>
}
export default (props: ITextAreaInputProps) => {
    const { binding, value, class: className, ...rest} = props;
    const handleInput = (e: JSX.TargetedInputEvent<HTMLTextAreaElement>) =>
        binding.value = (e.target as HTMLTextAreaElement).value;
    return <textarea {...rest} value={binding.value} onInput={handleInput}
        class={`p-2 rounded border border-gray-500 disabled:opacity-50 ${className ?? ''}`}/>;
}