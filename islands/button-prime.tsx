import { JSX } from "preact";
import RippleButton from './button-ripple.tsx';

export default (props: JSX.HTMLAttributes<HTMLButtonElement>) => {
    const { class: className, children, ...rest} = props;
    return <RippleButton {...rest}
        class={`bg-orange-400 disabled:hover:bg-orange-400 dark:bg-orange-700 dark:disabled:hover:bg-orange-700 hover:bg-orange-500 ${className ?? ''}`}>
            {children}
    </RippleButton>;
}