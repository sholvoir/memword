import * as mem from '../lib/mem.ts';
import * as app from './app.tsx';
import Dialog from './dialog.tsx';
import RButton from '@sholvoir/components/button-ripple';

export default () =>
    <Dialog title="快乐背单词" onBackClick={app.user.value?()=>app.go('home'):undefined}>
        <div class="about">
            <div>
                <h1>快乐背单词</h1>
                <p>版本：{mem.version}</p>
            </div>
            <div>
                <h1>语言基础</h1>
                <p>词汇是<b>语言的基础</b>，学习语言应该掌握一定数量的基础词汇。</p>
            </div>
            <div>
                <h1>高频词汇</h1>
                <p>每个词汇的重要程度是不一样的，越是使用<b>频率高的词汇</b>，其重要程度越高，本工具提供多种词频工具统计的结果词书。</p>
            </div>
            <div>
                <h1>遗忘曲线</h1>
                <p>记忆最大的敌人是遗忘，本工具依据「艾宾浩斯」<b>遗忘曲线</b>设计大脑刺激频率，以最大化记忆效率。</p>
            </div>
            <div>
                <h1>碎片时间</h1>
                <p>现代人工作学习都非常忙碌，充分利用好<b>碎片时间</b>，是成功的关键。</p>
            </div>
            <div>
                <h1>开始学习</h1>
                <p>使用你的电子邮件，单击
                    <RButton class="button btn-prime" 
                        title="login" onClick={()=>app.go('signup')}>登录
                    </RButton> 开始免费学习吧。</p>
            </div>
            <div>
                <h1>微信</h1>
                <p>*提示一：请使用<b>除微信以外</b>的其他浏览器，如果当前是在微信中，点击屏幕右上(...)，然后选择「在默认浏览器中打开」。</p>
            </div>
            <div>
                <h1>桌面</h1>
                <p>*提示二：请使用「共享」-「添加到主屏幕」（iOS）或「...」-「安装应用」（Android）安装 <b>Web应用</b> 到桌面，以便下次直接点击进入。</p>
            </div>
        </div>
    </Dialog>;