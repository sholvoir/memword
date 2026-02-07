import BButton from "@sholvoir/solid-components/button-base";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";

export default () => (
	<Dialog
		class="flex flex-col pb-4"
		left={
			<BButton
				class="text-[150%] icon--material-symbols icon--material-symbols--chevron-left align-bottom"
				onClick={() => app.go()}
			/>
		}
		title="帮助"
	>
		<ol class="list-decimal py-2 pr-2 pl-8 [&>li]:mx-2 overflow-y-auto">
			<li>
				如何使用本软件？
				<br />
				答：点击「学习」，开始学习即可；在学习界面，
				(1)当练习听力时，会先播放一小段声音，没有听清可以点击
				<div class="w-6 h-6 inline-block">&#8227;</div>
				或按下「B或C」快捷键或触摸屏幕的上半部分进行重听，
				(2)当练习阅读时，会先显示一个单词；
				然后在心里默想一个概念（意思），点击「答」或按下「空格键」或触摸屏幕下半区域，显示单词的音标和解释，
				并同时显示一个与该词相关的背景图片，检查是否和自己默想的答案一致，如果一致，点击「知」或按下「N或X」快捷键或向上滑动屏幕，
				否则点击「不」或按下「M或Z」快捷键或向下滑动屏幕。记住，要快速完成，不要在一个词上长时间停留，那样只会降低效率，
				我们的方法是快速/多次，从记忆效率来讲，次数的作用远远大于时长。这个方法称为大脑按摩，直接在拼写/声音和概念之间建立反射弧，
				所以不要犹豫，快速完成一个小冲刺。
			</li>
			<li>
				我应该学习哪些词汇？
				<br />
				答：我们的目标是在未来能够自由使用英语，应该先学重要的词汇，因为20%的英语词汇表达了80%的意思，
				抓住少数基本词，将能够快速提高英语水平。本软件提供多本词书供您选择，以适应您当下的需求。但不要太多关注词书，
				一个常用词通常会出现在多本词书中，不必介意它到底从哪里来。也可以不选择词书，直接基于词典
				（本词典收录25000多条常用词，不在词典中的词，对于学生而言，可以不必记忆了），在词典中查到自己在生活中遇到，
				但不会的词，直接开始学它，背它，终有一日，你再也遇不到生词的时候，你就已经功法大成了。
			</li>
			<li>
				我该如何复习？
				<br />
				答：完全不必操心这个事情，让系统决定，系统自动根据「艾宾浩斯」遗忘曲线来决定此时的最佳复习内容，
				你要做的事是每天利用碎片时间，拿出手机，开始「学习」。
			</li>
			<li class="[&>span]:align-[-20%]">
				界面上的按钮是什么意思？
				<br />
				<span class="text-[150%] icon--material-symbols icon--material-symbols--check-circle text-green-500"></span>
				: 我认识这个词；
				<br />
				<span class="text-[150%] icon--mdi icon--mdi--cross-circle text-fuchsia-500"></span>
				: 我不认识这个词；
				<br />
				<span class="text-[150%] icon--material-symbols icon--material-symbols--volume-up text-blue-500"></span>
				: 再播一遍声音；
				<br />
				<span class="text-[150%] icon--material-symbols icon--material-symbols--family-star text-yellow-500"></span>
				: 这个词我已经掌握，直接标记为「已完成」；
				<br />
				<span class="text-[150%] icon--material-symbols icon--material-symbols--error text-red-500"></span>
				: 这个词的翻译/声音/音标，有问题/错误，请人工处理。
				<br />
				<span class="text-[150%] icon--material-symbols icon--material-symbols--refresh text-purple-500"></span>
				: 忽略本地词典缓冲，从服务器重新下载这个词的翻译/声音/音标。
			</li>
			<li>
				关于「学习词书」
				<br />
				答：学习词书将一本词书的全部词添加进我的学习任务。但我们通常并不会直接开始学这些新词，而是优先复习旧词，
				掌握巩固一个旧词比学习一批新词更重要，这些新加的任务将会成为优先级最低的任务。
			</li>
			<li>
				关于登录和多设备
				<br />
				答：⓵软件设计为免密模式（不需要密码），在一个设备上只要用电子邮件验证身份之后，就再也不需要密码了，打开软件立即可以开始学习。
				<br />
				⓶在第二台设备上登录时，系统将自动同步学习记录和设置，你完全可以同时在电脑和手机上学习。
			</li>
			<li>
				以后有AI翻译了，我还用得着学英语吗？
				<br />
				答：AI或者任意翻译工具甚至包括人工翻译，都只能解决浅表问题，因为一门语言是无法准确表达另一门语言的含义的，
				一门语言的背后代表着文化和思维模式，这些深层次的东西是任何翻译都无法解决的。如果你有计划去英语文华圈生活/学习/工作，
				那你必需亲自用人脑学好它，仅仅翻译工具是不够的。
			</li>
		</ol>
	</Dialog>
);
