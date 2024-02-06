import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <title>MemWord</title>
        <link rel="icon" href="/favicon-light.svg" media="(prefers-color-scheme: light)"/>
        <link rel="icon" href="/favicon-dark.svg" media="(prefers-color-scheme: dark)"/>
        <link rel="stylesheet" href="/styles.css"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"/>
      </head>
      <body class="h-[100dvh] bg-slate-300 text-slate-800 dark:bg-slate-900 dark:text-slate-300" style="font-family: 'Roboto', sans-serif;">
        <Component/>
      </body>
    </html>
  );
}
