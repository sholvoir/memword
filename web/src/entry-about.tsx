import type { JSX } from "solid-js";
import { Dynamic, render } from "solid-js/web";
import "./index.css";
import "./icons.css";
import About from "./components/about.tsx";
import * as app from "./components/app.tsx";
import Signin from "./components/signin.tsx";
import Signup from "./components/signup.tsx";

const Entry = () => {
	const dialogs = new Map<app.TDial, () => JSX.Element>();
	dialogs.set("#about", About);
	dialogs.set("#signup", Signup);
	dialogs.set("#signin", Signin);
	app.setLoca("#about");

	return <Dynamic component={dialogs.get(app.loca())}></Dynamic>;
};

render(() => <Entry />, document.getElementById("root")!);
