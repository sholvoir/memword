import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// https://vite.dev/config/
export default defineConfig({
	base: "",
	plugins: [solid(), tailwindcss()],
	build: {
		target: "esnext",
		outDir: "docs",
		emptyOutDir: true,
		assetsDir: "assets",
		rollupOptions: {
			input: ["/index.html", "/about.html", "/admin.html"],
		},
	},
	server: {
		proxy: {
			'/api': 'http://localhost:8000'
		}
	}
});
