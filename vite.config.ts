import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/ai-guess-who/",
    plugins: [react()],
    build: {
        target: "esnext",
        cssCodeSplit: false,
    },
});
