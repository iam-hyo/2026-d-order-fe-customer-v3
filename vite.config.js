import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr({
            include: "**/*.svg?react",
            exclude: "",
        }),
    ],
    resolve: {
        alias: {
            "@components": path.resolve(__dirname, "src/components"),
            "@pages": path.resolve(__dirname, "src/pages"),
            "@routes": path.resolve(__dirname, "src/routes"),
            "@styles": path.resolve(__dirname, "src/styles"),
            "@hooks": path.resolve(__dirname, "src/hooks"),
            "@assets": path.resolve(__dirname, "src/assets"),
            "@constants": path.resolve(__dirname, "src/constants"),
            "@services": path.resolve(__dirname, "src/services"),
            "@stores": path.resolve(__dirname, "src/stores"),
            "@utils": path.resolve(__dirname, "src/utils"),
        },
    },
});
