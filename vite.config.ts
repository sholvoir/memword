import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from 'solid-devtools/vite';

export default defineConfig({
   plugins: [devtools(), solidPlugin(), tailwindcss()],
   base: "",
   build: {
      target: "esnext",
      outDir: "docs",
      emptyOutDir: true,
      rollupOptions: {
         input: ["/index.html", "/about.html"],
      },
   },
   server: {
      proxy: {
         "/api": "http://localhost:8000",
         changeOrigin: "http://localhost:5173",
      },
   },
});
