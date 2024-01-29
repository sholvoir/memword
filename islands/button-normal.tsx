import { JSX } from "preact";
import RippleButton from './button-ripple.tsx';

export default (props: JSX.HTMLAttributes<HTMLButtonElement>) => {
    const { class: className, children, ...rest} = props;
    return <RippleButton {...rest}
        class={`bg-slate-400 hover:bg-slate-500 disabled:hover:bg-slate-400 dark:bg-slate-700 disabled:hover:dark:bg-slate-700 ${className ?? ''}`}>{children}
    </RippleButton>;
}