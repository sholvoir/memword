import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface ITextInputProps extends JSX.HTMLAttributes<HTMLInputElement>{
    binding: Signal<boolean>;
    label: string;
}
export default (props: ITextInputProps) => {
    const { name, value, label, binding, class: className, ...rest} = props;
    const handleClick = () => {
        binding.value = !binding.value
    };
    return <div class={className ?? ''}>
        <input type="checkbox" name={name} {...rest} checked={binding.value}
            class={`mr-2 disabled:opacity-50`}
            onClick={handleClick}/>
        <label for={name} onClick={handleClick}>{label}</label>
    </div>

}       