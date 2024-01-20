import { JSX } from "preact";
import { useSignal } from "@preact/signals";

export default (props: JSX.HTMLAttributes<HTMLButtonElement>) => {
    const { class: className, children, disabled, onClick, ...rest} = props;
    const enabled = useSignal(true);
    const handleClick = async (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        enabled.value = false;
        if (onClick) await onClick(e);
        enabled.value = true;
    };
    return <button {...rest} class={`disabled:opacity-50 ${className ?? ''}`} type="button"
        onClick={handleClick} disabled={!enabled.value || disabled}>{children}</button>
;}