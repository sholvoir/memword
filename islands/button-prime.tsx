import { JSX } from "preact";
import RippleButton from './button-ripple.tsx';

export default (props: JSX.HTMLAttributes<HTMLButtonElement>) => {
    const { class: className, children, ...rest} = props;
    return <RippleButton {...rest}
        class={`bg-indigo-700 text-white hover:bg-indigo-500 hover:disabled:bg-indigo-700' ${className ?? ''}`}>
            {children}
    </RippleButton>;
}