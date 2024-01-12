import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MemWord</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" />
      </head>
      <body class="h-[100dvh]" style="font-family: 'Roboto', sans-serif;">
        <Component />
      </body>
    </html>
  );
}
