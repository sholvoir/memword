import { JSX } from "preact";
import RippleButton from './button-ripple.tsx';

export default (props: JSX.HTMLAttributes<HTMLButtonElement>) => {
    const { class: className, children, ...rest} = props;
    return <RippleButton {...rest}
        class={`bg-gray-300 ${className ?? ''}`}>{children}
    </RippleButton>;
}