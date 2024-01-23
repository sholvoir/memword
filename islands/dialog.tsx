import PButton from './button-prime.tsx';

interface IDialogProps {
    content: string;
    onFinish: () => void;
};

export default ({content, onFinish}: IDialogProps) => {
    return <div class="flex justify-center items-center">
    <div class="size-fit max-w-[80%] p-3 rounded-md">
        <div class="m-6 leading-loose text-center">{content}</div>
        <div class="m-6 text-center">
            <PButton class="w-32" onClick={onFinish}>确定</PButton>
        </div>
    </div>
</div>;
}