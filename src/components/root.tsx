import { type JSX, onMount } from "solid-js";
import { Dynamic } from "solid-js/web";
import { maxAge } from "#srv/lib/common.ts";
import type { TDialog } from "../lib/idialog.ts";
import * as mem from "../lib/mem.ts";
import About from "./about.tsx";
import Book from "./book.tsx";
import Help from "./help.tsx";
import Home from "./home.tsx";
import Issue from "./issue.tsx";
import { go, page, setUser } from "./provider-g.ts";
import { totalStats } from "./provider-stat.ts";
import Sentence from "./sentence.tsx";
import Setting from "./setting.tsx";
import Signin from "./signin.tsx";
import Signup from "./signup.tsx";
import Study from "./study.tsx";
import Trans from "./trans.tsx";

export default () => {
   const dialogs = new Map<TDialog, () => JSX.Element>();
   dialogs.set("#empty", () => <div />);
   dialogs.set("#about", () => <About />);
   dialogs.set("#help", () => <Help />);
   dialogs.set("#issue", () => <Issue />);
   dialogs.set("#book", () => <Book />);
   dialogs.set("#setting", () => <Setting />);
   dialogs.set("#signup", () => <Signup />);
   dialogs.set("#signin", () => <Signin />);
   dialogs.set("#sentence", () => <Sentence />);
   dialogs.set("#trans", () => <Trans />);
   dialogs.set("#home", () => <Home />);
   dialogs.set("#study", () => <Study />);

   onMount(async () => {
      await mem.initSVersion();
      const user = await mem.getUser();
      if (!user || user.expired < Date.now()) {
         go("#about");
      } else {
         setUser(user);
         if (user.expired - Date.now() < (maxAge * 1000) / 3) mem.renewAuth();
         go(await mem.getPage());
         await totalStats();
         await mem.init();
         await totalStats();
      }
   });
   return <Dynamic component={dialogs.get(page())}></Dynamic>;
};
