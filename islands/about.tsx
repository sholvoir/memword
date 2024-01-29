import Tab from './tab.tsx';
import RButton from './button-ripple.tsx';

interface IAboutProps {
    handleMenuClick: (e: Event) => void
}
export default ({handleMenuClick}: IAboutProps) => <Tab title="MemWord">
    <div class="[&>div]:w-full [&>div]:min-h-80 [&>div]:p-5 [&>div]:flex [&>div]:flex-col [&>div]:justify-center [&>div>h1]:mb-4 [&>div>h1]:text-5xl [&>div>p]:text-2xl font-extrabold">
        <div class="bg-slate-200 text-slate-800">
            <h1>语言基础</h1>
            <p>词汇是语言的基础，学习语言应该掌握一定数量的基础词汇词汇是语言的基础。</p>
        </div>
        <div class="bg-slate-800 text-slate-300">
            <h1>高频词汇</h1>
            <p>每个词汇的重要程度是不一样的，越是使用<b>频率高的词汇</b>，其重要程度越高，本工具提供多种词频工具统计的结果。</p>
        </div>
        <div class="bg-slate-200 text-slate-800">
            <h1>遗忘曲线</h1>
            <p>记忆最大的敌人是遗忘，本工具依据「艾宾浩斯」<b>遗忘曲线</b>设计大脑刺激频率，以最大化记忆效率。</p>
        </div>
        <div class="bg-slate-800 text-slate-300">
            <h1>碎片时间</h1>
            <p>现代人工作学习都非常忙碌，充分利用好<b>碎片时间</b>，是成功的关键。</p>
        </div>
        <div class="bg-slate-200 text-slate-800">
            <h1>开始学习</h1>
            <p>使用你的电子邮件，单击<RButton class="w-32 bg-orange-400 hover:bg-orange-500" title="login" onClick={handleMenuClick}>登录</RButton>开始免费学习吧。</p>
        </div>
        <div class="bg-slate-800 text-slate-300">
            <h1>微信</h1>
            <p>*提示一：请使用<b>除微信以外</b>的其他浏览器，如果是微信，点击屏幕右上(...)，然后选择「在默认浏览器中打开」。</p>
        </div>
        <div class="bg-slate-300 text-slate-800">
            <h1>桌面</h1>
            <p>*提示二：请使用「共享」-「添加到桌面」将本页安装成 <b>Web App</b>，以便下次直接点击进入。</p>
        </div>
    </div>
</Tab>;