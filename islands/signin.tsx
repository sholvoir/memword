import { useSignal } from "@preact/signals";
import { signals, showTips, signup, login } from '../lib/mem.ts';
import PButton from './button-prime.tsx';
import AButton from './button-anchor.tsx';
import TInput from './input-text.tsx';
import Dialog from './dialog.tsx';

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
export default () => {
    const email = useSignal(signals.user.value ? atob(signals.user.value) : '');
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
            const resp = await signup(email.value);
            if (!resp.ok) showTips('网络错误!');
            else showTips('临时密码已发送!');
        }
    };
    const handleClickLogin = async () => {
        const resp = await login(email.value, password.value);
        if (!resp.ok) showTips('Email或密码验证错误');
        else {
            if (timer) clearInterval(timer);
            location.reload();
        }
    };
    return <Dialog title="登录">
        <div class="p-2 h-full w-64 mx-auto flex flex-col gap-4">
            <div class="flex flex-col">
                <TInput name="email" placeholder="Email" binding={email} />
                <AButton class="block text-right" onClick={handleSend} disabled={!canSendEmail.value}>
                    Send temporary password {counter.value > 0 ? `(${counter.value})` : ''}
                </AButton>
            </div>
            <TInput name="password" placeholder="Password" binding={password} />
            <PButton onClick={handleClickLogin}>确定</PButton>
        </div>
    </Dialog>
}