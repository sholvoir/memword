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
         "/api": "http://localhost:8000",
         changeOrigin: "http://localhost:5173",
      },
   },
});
