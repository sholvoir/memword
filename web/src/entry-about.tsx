import { createSignal, type JSX } from "solid-js";
import { Dynamic, render } from "solid-js/web";
import "./components/index.css";
import "./components/icons.css";
import About from "./components/about.tsx";
import Signin from "./components/signin.tsx";
import Signup from "./components/signup.tsx";
import type { TDial } from "./lib/idial.ts";

const Entry = () => {
   const [loca, setLoca] = createSignal<TDial>("#about");
   const [name, setName] = createSignal("");
   const [tips, setTips] = createSignal("");

   let timeout: NodeJS.Timeout | undefined;
   const go = (d?: TDial) => setLoca(d ?? "#about");
   const hideTips = () => setTips("");
   const showTips = (content: string, autohide = true) => {
      setTips(content);
      if (autohide) {
         if (timeout) clearTimeout(timeout);
         timeout = setTimeout(hideTips, 3000);
      }
   };

   const dialogs = new Map<TDial, () => JSX.Element>();
   dialogs.set("#about", () => <About go={go} />);
   dialogs.set("#signup", () => (
      <Signup
         go={go}
         name={name}
         setName={setName}
         showTips={showTips}
         tips={tips}
      />
   ));
   dialogs.set("#signin", () => (
      <Signin
         go={go}
         name={name}
         setName={setName}
         showTips={showTips}
         tips={tips}
      />
   ));

   return <Dynamic component={dialogs.get(loca())}></Dynamic>;
};

render(() => <Entry />, document.getElementById("root")!);
