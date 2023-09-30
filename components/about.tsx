interface AboutProps {
    isLogin: boolean
}
export default ({isLogin}: AboutProps) => (<>
    {isLogin && <div class="text-right uppercase"><button>Login</button></div>}
</>)