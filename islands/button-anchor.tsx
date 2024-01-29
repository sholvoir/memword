import { JSX } from "preact";
import SButton from './button-anti-shake.tsx';

export default (props: JSX.HTMLAttributes<HTMLButtonElement>) => {
    const { class: className, children, ...rest} = props;
    return <SButton {...rest}
        class={`text-blue-800 dark:text-blue-300 hover:underline disabled:opacity-50 active:bg-pink-800 ${className ?? ''}`}>{children}
    </SButton>;
}