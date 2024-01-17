import { Signal, useSignal } from "@preact/signals";
import { Loca } from "./root.tsx";
import * as mem from '../lib/mem.ts';

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

interface ISigninProps {
    showTips: (content: string) => void;
    showDialog: (content: string, backLoca: Loca) => void
}

export default ({showTips, showDialog}: ISigninProps) => {
    const state: Record<string, Signal> = {
        email: useSignal(mem.setting.user ? atob(mem.setting.user) : ''),
        password: useSignal('')
    };
    const counter = useSignal(0);
    const canSendEmail = useSignal(true);
    const handleStateChange = (ev: Event) => {
        const target = ev.target as HTMLInputElement;
        state[target.name].value = target.value;
    };
    let timer: number|undefined;
    const handleSend = async () => {
        if (!emailPattern.test(state.email.value)) showTips('Invalid email address!');
        else {
            const resp = await mem.signup(state.email.value);
            if (!resp.ok) showDialog(await resp.text(), 'login');
            else {
                showTips('Temporary password sent!');
                canSendEmail.value = false;
                counter.value = 60;
                timer = setInterval(() => {
                    if (--counter.value <= 0) {
                        clearInterval(timer);
                        timer = undefined;
                        canSendEmail.value = true;
                    }
                }, 1000);
            }
        }
    };
    const handleClickSignup = async () => {
        const resp = await mem.login(state.email.value, state.password.value);
        if (!resp.ok) showTips('Invail email or password');
        else {
            mem.setSetting(await resp.json());
            if (timer) clearInterval(timer);
            location.reload();
        }
    };
    return <div class="h-full w-64 mx-auto grid grid-cols-1 gap-4 content-center">
        <div class="flex flex-col">
            <input type="email" name="email" placeholder="Email"
                class="w-64 p-2 rounded border border-gray-500 block disabled:opacity-50"
                disabled={!canSendEmail.value}
                value={state.email.value} onInput={handleStateChange}/>
            <a class="block text-right underline text-blue-700 cursor-pointer aria-disabled:opacity-50"
                onClick={handleSend} aria-disabled={!canSendEmail.value}>
                Send temporary password {counter.value > 0 ? `(${counter.value})` : ''}</a>
        </div>
        <div><input
            type="text"
            name="password"
            placeholder="Password"
            class="w-64 p-2 rounded border border-gray-500"
            value={state.password.value}
            onInput={handleStateChange}
        /></div>
        <div>
            <button class="w-64 p-2 bg-indigo-700 text-white rounded"
                onClick={handleClickSignup}>OK</button>
        </div>
    </div>;
}