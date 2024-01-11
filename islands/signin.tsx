import { useSignal } from "@preact/signals";
import { getUser, signup } from "../lib/mem.ts";
import { Loca } from "./root.tsx";

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

interface ISigninProps {
    showDialog: (content: string, backLoca: Loca) => void
}

export default ({showDialog}: ISigninProps) => {
    const email = useSignal(getUser() ?? '');
    const handleEmailChange = ({ target }: Event) => {
        email.value = (target as HTMLInputElement).value;
    }
    const handleClickSignup = async () => {
        if (!emailPattern.test(email.value)) showDialog('Invalid email address', 'signin');
        else {
            const resp = await signup(email.value);
            if (!resp.ok) showDialog(await resp.text(), 'about');
            else showDialog('The Active Email have alread sent to you.', 'about');
        }
    };
    return <div class="h-full grid grid-cols-1 gap-4 content-center [&>div]:text-center">
        <div><input
            type="email"
            name="email"
            placeholder="Your Email"
            class="w-64 px-2 rounded border border-gray-500"
            value={email}
            onInput={handleEmailChange}
        /></div>
        <div><button
            class="w-64 p-2 bg-indigo-700 text-white rounded"
            onClick={handleClickSignup}>
                Signin
        </button></div>
        
    </div>;
}