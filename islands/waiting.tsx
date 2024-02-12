interface IWaitingProps {
    prompt: string;
}
export default ({prompt}: IWaitingProps) => <div class="fixed inset-0 bg-slate-300 dark:bg-slate-900 flex justify-center items-center"><div>{prompt}</div></div>;