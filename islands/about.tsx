import Tab from './tab.tsx';

interface IAboutProps {
    handleMenuClick: (e: Event) => void
}
export default ({handleMenuClick}: IAboutProps) => <Tab title="关于">
    <div class="flex flex-col gap-3 overflow-y-auto [&>div>b]:text-orange-700">
        <div>这是一个记忆单词的工具，基于以下理念设计：</div>
        <ul class="list-disc list-inside px-2 [&>li>b]:text-orange-700">
            <li>词汇是<b>语言的基础</b>，学习语言应该掌握一定数量的基础词汇。</li>
            <li>每个词汇的重要程度是不一样的，越是<b>常用的词汇</b>其重要程度越高，本工具提供多种词频工具统计的结果。</li>
            <li>记忆最大的敌人是遗忘，本工具依据「艾宾浩斯」<b>遗忘曲线</b>设计大脑刺激频率，以最大化记忆效率。</li>
            <li>现代人工作学习都非常忙碌，充分利用好<b>碎片时间</b>，是成功的关键。</li>
        </ul>
        <div>使用你的电子邮件，单击<menu class="inline-block bg-indigo-800 text-white px-2 mx-1 rounded font-bold cursor-pointer" title="login" onClick={handleMenuClick}>登录</menu>开始免费学习吧。</div>
        <div>*提示一：请使用<b>除微信以外</b>的其他浏览器，如果是微信，点击屏幕右上(...)，然后选择「在默认浏览器中打开」。</div>
        <div>*提示二：请使用「共享」-「添加到桌面」将本页安装成 <b>Web App</b>，以便下次直接点击进入。</div>
    </div>
</Tab>;