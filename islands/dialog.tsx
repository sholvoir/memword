interface DialogProps {
    content: string;
    onFinish: () => void;
};

export default ({content, onFinish}: DialogProps) => {
    return <div class="flex justify-center items-center">
    <div class="size-fit max-w-[80%] p-3 rounded-md">
        <div class="m-6 leading-loose text-center">{content}</div>
        <div class="m-6 text-center">
            <button class="w-32 p-2 bg-indigo-700 text-white rounded" onClick={onFinish}>OK</button>
        </div>
    </div>
</div>;
}