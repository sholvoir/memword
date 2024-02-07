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
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <link rel="apple-touch-icon" sizes="120x120" href="/icon/icon-120.png"></link>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon/icon-180.png"></link>
        <link rel="apple-touch-icon" sizes="512x512" href="/icon/icon-512.png"></link>
        <link rel="apple-touch-icon" sizes="1024x1024" href="/icon/icon-1024.png"></link>
        <meta name="theme-color" content="#CBD5E1" media="(prefers-color-scheme: light)"/>
        <meta name="theme-color" content="#0F172A" media="(prefers-color-scheme: dark)"/>
        <link rel="stylesheet" href="/styles.css"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"/>
      </head>
      <body class="h-[100dvh] bg-slate-300 text-slate-800 dark:bg-slate-900 dark:text-slate-300" style="font-family: 'Roboto', sans-serif;">
        <Component/>
      </body>
    </html>
  );
}