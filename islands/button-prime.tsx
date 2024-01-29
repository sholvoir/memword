import { JSX } from "preact";
import RippleButton from './button-ripple.tsx';

export default (props: JSX.HTMLAttributes<HTMLButtonElement>) => {
    const { class: className, children, ...rest} = props;
    return <RippleButton {...rest}
        class={`bg-orange-700 text-white hover:bg-orange-500 hover:disabled:bg-orange-700' ${className ?? ''}`}>
            {children}
    </RippleButton>;
}