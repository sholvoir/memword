import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <title>MemWord</title>
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icon/icon-57.png"/>
        <link rel="apple-touch-icon" sizes="60x60" href="/icon/icon-60.png"/>
        <link rel="apple-touch-icon" sizes="72x72" href="/icon/icon-72.png"/>
        <link rel="apple-touch-icon" sizes="76x76" href="/icon/icon-76.png"/>
        <link rel="apple-touch-icon" sizes="120x120" href="/icon/icon-120.png"/>
        <link rel="apple-touch-icon" sizes="144x144" href="/icon/icon-144.png"/>
        <link rel="apple-touch-icon" sizes="152x152" href="/icon/icon-152.png"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon/icon-180.png"/>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" />
      </head>
      <body class="h-[100dvh]" style="font-family: 'Roboto', sans-serif;">
        <Component />
      </body>
    </html>
  );
}
