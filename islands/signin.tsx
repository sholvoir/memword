import { Signal, useSignal } from "@preact/signals";
import { signup, login } from "../lib/mem.ts";
import { Loca } from "./root.tsx";
import Cookies from "js-cookie";
import * as mem from '../lib/mem.ts';

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

interface ISigninProps {
    showDialog: (content: string, backLoca: Loca) => void
}

export default ({showDialog}: ISigninProps) => {
    const state: Record<string, Signal> = {
        email: useSignal(mem.user ? atob(mem.user) : ''),
        password: useSignal('')
    };
    const isPassSent = useSignal(false);
    const handleStateChange = (ev: Event) => {
        const target = ev.target as HTMLInputElement;
        state[target.name].value = target.value;
    }
    const handleClickSignup = async () => {
        if (isPassSent.value) {
            const resp = await login(state.email.value, state.password.value);
            if (!resp.ok) showDialog('Invail email or password', 'login');
            else location.reload();
        } else if (!emailPattern.test(state.email.value))
            showDialog('Invalid email address', 'login');
        else {
            const resp = await signup(state.email.value);
            if (!resp.ok) showDialog(await resp.text(), 'login');
            else isPassSent.value = true;
        }
    };
    return <div class="h-full grid grid-cols-1 gap-4 content-center [&>div]:text-center">
        {isPassSent.value && <div>The Active Email have alread sent to you.</div>}
        <div><input
            type="email"
            name="email"
            placeholder="Email"
            class="w-64 p-2 rounded border border-gray-500"
            value={state.email.value}
            disabled={isPassSent.value}
            onInput={handleStateChange}
        /></div>
        {isPassSent.value && <div><input
            type="password"
            name="password"
            placeholder="Password"
            class="w-64 p-2 rounded border border-gray-500"
            value={state.password.value}
            onInput={handleStateChange}
        /></div>}
        <div><button
            class="w-64 p-2 bg-indigo-700 text-white rounded"
            onClick={handleClickSignup}>
                OK
        </button></div>
    </div>;
}