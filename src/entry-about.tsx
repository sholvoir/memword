import { createSignal, type JSX, onMount } from "solid-js";
import { Dynamic, render } from "solid-js/web";
import "./components/index.css";
import "./components/icons.css";
import About from "./components/about.tsx";
import GProvider, { useG } from "./components/g-provider.tsx";
import Signin from "./components/signin.tsx";
import Signup from "./components/signup.tsx";
import type { TDial } from "./lib/idial.ts";
import * as idb from "./lib/indexdb.ts";
import * as srv from "./lib/server.ts";

const Entry = () => {
   const [sversion, setSversion] = createSignal("");
   const [name, setName] = createSignal("");
   const { loca } = useG()!;

   const dialogs = new Map<TDial, () => JSX.Element>();
   dialogs.set("#about", () => <About sversion={sversion()} />);
   dialogs.set("#signup", () => <Signup name={name} setName={setName} />);
   dialogs.set("#signin", () => <Signin name={name} setName={setName} />);

   onMount(async () => {
      setSversion(((await idb.getMeta("_s-version")) as string) ?? "");
      srv.version_get().then((v) => {
         v && setSversion(v) && idb.setMeta("_s-version", v);
      });
   });

   return <Dynamic component={dialogs.get(loca() ?? "#about")}></Dynamic>;
};

render(
   () => (
      <GProvider>
         <Entry />
      </GProvider>
   ),
   document.getElementById("root")!,
);
