import type { JSX } from "solid-js";
import { Dynamic, render } from "solid-js/web";
import "./index.css";
import "./icons.css";
import About from "./about.tsx";
import * as app from "./app.tsx";
import Signin from "./signin.tsx";
import Signup from "./signup.tsx";

const Entry = () => {
	const dialogs = new Map<app.TDial, () => JSX.Element>();
	dialogs.set("#about", About);
	dialogs.set("#signup", Signup);
	dialogs.set("#signin", Signin);
	app.setLoca("#about");

	return <Dynamic component={dialogs.get(app.loca())}></Dynamic>;
};

render(() => <Entry />, document.getElementById("root")!);
