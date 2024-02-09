import { JSX } from "preact";
import { useSignal } from "@preact/signals";
import AntiShakeButton from './button-anti-shake.tsx';

export default (props: JSX.HTMLAttributes<HTMLButtonElement>) => {
    const { class: className, children, onClick, ...rest} = props;
    const showRipple = useSignal(false);
    const rippleStyle = useSignal('');
    const handleClick = (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        const btn = e.currentTarget;
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        rippleStyle.value = `width: ${diameter}px; height: ${diameter}px; left: ${
            e.offsetX - radius}px; top: ${e.offsetY - radius}px`;
        showRipple.value = true;
        setTimeout(()=>showRipple.value = false, 610);
        if (onClick) onClick(e);
    }
    return <AntiShakeButton
        {...rest}
        class={`rounded-md p-2 min-w-max overflow-hidden relative ${className ?? ''}`}
        onClick={handleClick} >
            {children}
            {showRipple.value && <span style={rippleStyle.value}
                class="absolute scale-0 rounded-[50%] animate-[ripple_600ms_linear_0s] bg-[#fffa]"/>}
    </AntiShakeButton>;
}