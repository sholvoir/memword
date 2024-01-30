import Tab from './tab.tsx';
import IconCut from "tabler_icons/cut.tsx";
import IconRefresh from "tabler_icons/refresh.tsx";
import IconAlertCircleFilled from "tabler_icons/alert-circle-filled.tsx";
import IconCircleCaretRight from "tabler_icons/circle-caret-right.tsx";
import IconCircleLetterF from "tabler_icons/circle-letter-f.tsx";

export default () => <Tab title="帮助"><ol class="list-decimal p-2 pl-8">
    <li>如何使用本软件？
        <br/>答：点击「学习」，开始学习即可；在学习界面，会显示一个单词，或播放一小段声音，取决于你正在练习听力还是阅读，在心里默想一个概念（意思），点击「答案」，检查是否和自己默想的答案一致，如果一致，点击「知道」，否则点击「不会」。记住，要快速完成，不要在一个词上长时间停留，那样只会降低效率，我们的方法是快速/多次，从记忆效率来讲，次数的作用远远大于时长。这个方法称为大脑按摩，直接在拼写/声音和概念之间建立反射弧，所以不要犹豫，快速完成一个小冲刺。
    </li>
    <li>我应该学习哪些词汇？
        <br/>答：我们的目标是在未来能够自由使用英语，应该先学重要的词汇，因为20%的英语词汇表达了80%的意思，抓住少数基本词，将能够快速提高英语水平。本软件提供多本词书供您选择，以适应您当下的需求。但不要太多关注词书，一个常用词通常会出现在多本词书中，不必介意它到底从哪里来。也可以不选择词书，直接基于词典（本词典收录25000多条常用词，不在词典中的词，对于学生而言，可以不必记忆了），在词典中查到自己在生活中遇到，但不会的词，直接开始学它，背它，终有一日，你再也遇不到生词的时候，你就已经功法大成了。
    </li>
    <li>我该如何复习？
        <br/>答：完全不必操心这个事情，让系统决定，系统自动根据「艾宾浩斯」遗忘曲线来决定此时的最佳复习内容，你要做的事是每天利用碎片时间，拿出手机，开始「学习」。
    </li>
    <li>界面上的按钮是什么意思？
        <br/><IconCircleCaretRight class="w-6 h-6 inline-block"/>: 再播一遍声音；
        <br/><IconCircleLetterF class="w-6 h-6 inline-block"/>: 这个词我已经掌握，直接标记为「已完成」；
        <br/><IconCut class="w-6 h-6 inline-block"/>: 这个词是生僻词，从我的任务列表中删除；
        <br/><IconAlertCircleFilled class="w-6 h-6 inline-block"/>: 这个词的翻译/声音/音标，有问题，报告，请人工处理。
        <br/><IconRefresh class="w-6 h-6 inline-block"/>: 忽略本地词典缓冲，从服务器重新下载这个词的翻译/声音/音标。
    </li>
</ol></Tab>