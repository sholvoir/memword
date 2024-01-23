import { Signal, useSignal } from "@preact/signals";
import { Loca } from "./root.tsx";
import * as mem from '../lib/mem.ts';
import PButton from './button-prime.tsx';
import AButton from './button-anchor.tsx';
import TInput from './input-text.tsx';

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

interface ISigninProps {
    user: Signal<string|undefined>;
    showTips: (content: string) => void;
    showDialog: (content: string, backLoca: Loca) => void
}

export default ({user, showTips, showDialog}: ISigninProps) => {
    const email = useSignal(user.value ? atob(user.value) : '');
    const password = useSignal('');
    const counter = useSignal(0);
    const canSendEmail = useSignal(true);
    let timer: number|undefined;
    const handleSend = async () => {
        if (!emailPattern.test(email.value)) showTips('Invalid email address!');
        else {
            canSendEmail.value = false;
            counter.value = 60;
            timer = setInterval(() => {
                if (--counter.value <= 0) {
                    clearInterval(timer);
                    timer = undefined;
                    canSendEmail.value = true;
                }
            }, 1000);
            const resp = await mem.signup(email.value);
            if (!resp.ok) showDialog(await resp.text(), 'login');
            else showTips('Temporary password sent!');
        }
    };
    const handleClickSignup = async () => {
        const resp = await mem.login(email.value, password.value);
        if (!resp.ok) showTips('Invail email or password');
        else {
            if (timer) clearInterval(timer);
            location.reload();
        }
    };
    return <div class="h-full w-64 mx-auto flex flex-col gap-4 justify-center">
        <div class="flex flex-col">
            <TInput name="email" placeholder="Email" binding={email} />
            <AButton class="block text-right" onClick={handleSend} disabled={!canSendEmail.value}>
                Send temporary password {counter.value > 0 ? `(${counter.value})` : ''}
            </AButton>
        </div>
        <TInput name="password" placeholder="Password" binding={password} />
        <PButton onClick={handleClickSignup}>确定</PButton>
    </div>;
}