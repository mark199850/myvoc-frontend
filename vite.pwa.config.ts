import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    root: 'web',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        }
    },
    build: {
        outDir: '../dist-web',
        emptyOutDir: true,
    }
});
