import tailwindcss from "@tailwindcss/vite";
import devtools from "solid-devtools/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
   plugins: [devtools(), solidPlugin(), tailwindcss()],
   base: "",
   build: {
      target: "esnext",
      outDir: "docs",
      emptyOutDir: true,
   },
   server: {
      proxy: {
         "/signup": {
            target: "http://localhost:8000",
            changeOrigin: true,
         },
         "/otp": {
            target: "http://localhost:8000",
            changeOrigin: true,
         },
         "/signin": {
            target: "http://localhost:8000",
            changeOrigin: true,
         },
         "/renew": {
            target: "http://localhost:8000",
            changeOrigin: true,
         },
         "/signout": {
            target: "http://localhost:8000",
            changeOrigin: true,
         },
         "/api": {
            target: "http://localhost:8000",
            changeOrigin: true,
         },
      },
   },
});
