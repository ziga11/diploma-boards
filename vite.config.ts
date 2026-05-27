import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
        build: {
                outDir: 'dist',
                rollupOptions: {
                        input: {
                                board: resolve(__dirname, 'board.html'),
                                index: resolve(__dirname, 'index.html'),
                                login: resolve(__dirname, 'login.html'),
                                not_found: resolve(__dirname, '404.html'),
                        },
                },
        },
});

