import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>MemWord</title>
        <link rel="icon" type="image/png" sizes="192x192" href="/icon/icon-192.png"/>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-startup-image" href="/icon/icon-1024.png"/>
        <meta name="apple-mobile-web-app-title" content="MemWord"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="theme-color" content="#CBD5E1" media="(prefers-color-scheme: light)"/>
        <meta name="theme-color" content="#0F172A" media="(prefers-color-scheme: dark)"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"/>
        <link rel="stylesheet" href="https://raw.esm.sh/gh/sholvoir/preact-components@0.0.7/static/button-ripple.css" crossOrigin=""/>
        <link rel="stylesheet" href="https://raw.esm.sh/gh/sholvoir/preact-components@0.0.7/static/input-text.css" crossOrigin=""/>
        <link rel="stylesheet" href="https://raw.esm.sh/gh/sholvoir/preact-components@0.0.7/static/checkbox.css" crossOrigin=""/>
        <link rel="stylesheet" href="https://raw.esm.sh/gh/sholvoir/preact-components@0.0.7/static/select.css" crossOrigin=""/>
        <link rel="stylesheet" href="/styles.css"/>
      </head>
      <body class="bg-slate-300 text-slate-800 dark:bg-slate-900 dark:text-slate-300"  style="font-family: 'Noto Sans SC', 'Noto Sans', system-ui, sans-serif;">
        <Component/>
      </body>
    </html>
  );
}