import { Head } from "$fresh/runtime.ts";
import Lookup from "../islands/Lookup.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>MEM</title>
        <link rel="icon" href="/mem.svg" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <img src="/dict.svg" class="w-32 h-32" />
        <Lookup />
      </div>
    </>
  );
}
