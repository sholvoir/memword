import Tab from './tab.tsx';

interface IMenuProps {
    handleMenuClick: (e: Event) => void
}
export default ({ handleMenuClick }: IMenuProps) => {
    return <Tab title="菜单">
        <div class="p-2 [&>menu]:p-2 [&>menu]:cursor-pointer [&>div]:h-px [&>div]:bg-slate-500">
            <menu title="issue" onClick={handleMenuClick}>报告问题</menu>
            <div/>
            <menu title="start" onClick={handleMenuClick}>学习词书</menu>
            <div/>
            <menu title="setting" onClick={handleMenuClick}>设置</menu>
            <div/>
            <menu title="about" onClick={handleMenuClick}>关于</menu>
            <div/>
            <menu title="help" onClick={handleMenuClick}>帮助</menu>
            <div/>
            <menu title="logout" onClick={handleMenuClick}>登出</menu>
        </div>
    </Tab>
}