// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_root_auth_middleware from "./routes/(root)/(auth)/_middleware.ts";
import * as $_root_auth_issue from "./routes/(root)/(auth)/issue.ts";
import * as $_root_auth_setting from "./routes/(root)/(auth)/setting.ts";
import * as $_root_auth_task from "./routes/(root)/(auth)/task.ts";
import * as $_root_middleware from "./routes/(root)/_middleware.ts";
import * as $_root_index from "./routes/(root)/index.tsx";
import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $login from "./routes/login.ts";
import * as $signup from "./routes/signup.ts";
import * as $about from "./islands/about.tsx";
import * as $dialog from "./islands/dialog.tsx";
import * as $dict from "./islands/dict.tsx";
import * as $help from "./islands/help.tsx";
import * as $home from "./islands/home.tsx";
import * as $icon_dict from "./islands/icon-dict.tsx";
import * as $icon_me from "./islands/icon-me.tsx";
import * as $icon_stats from "./islands/icon-stats.tsx";
import * as $icon_study from "./islands/icon-study.tsx";
import * as $issue from "./islands/issue.tsx";
import * as $menu from "./islands/menu.tsx";
import * as $root from "./islands/root.tsx";
import * as $setting from "./islands/setting.tsx";
import * as $signin from "./islands/signin.tsx";
import * as $signout from "./islands/signout.tsx";
import * as $start from "./islands/start.tsx";
import * as $stat from "./islands/stat.tsx";
import * as $stats from "./islands/stats.tsx";
import * as $study from "./islands/study.tsx";
import * as $waiting from "./islands/waiting.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/(root)/(auth)/_middleware.ts": $_root_auth_middleware,
    "./routes/(root)/(auth)/issue.ts": $_root_auth_issue,
    "./routes/(root)/(auth)/setting.ts": $_root_auth_setting,
    "./routes/(root)/(auth)/task.ts": $_root_auth_task,
    "./routes/(root)/_middleware.ts": $_root_middleware,
    "./routes/(root)/index.tsx": $_root_index,
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/login.ts": $login,
    "./routes/signup.ts": $signup,
  },
  islands: {
    "./islands/about.tsx": $about,
    "./islands/dialog.tsx": $dialog,
    "./islands/dict.tsx": $dict,
    "./islands/help.tsx": $help,
    "./islands/home.tsx": $home,
    "./islands/icon-dict.tsx": $icon_dict,
    "./islands/icon-me.tsx": $icon_me,
    "./islands/icon-stats.tsx": $icon_stats,
    "./islands/icon-study.tsx": $icon_study,
    "./islands/issue.tsx": $issue,
    "./islands/menu.tsx": $menu,
    "./islands/root.tsx": $root,
    "./islands/setting.tsx": $setting,
    "./islands/signin.tsx": $signin,
    "./islands/signout.tsx": $signout,
    "./islands/start.tsx": $start,
    "./islands/stat.tsx": $stat,
    "./islands/stats.tsx": $stats,
    "./islands/study.tsx": $study,
    "./islands/waiting.tsx": $waiting,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
