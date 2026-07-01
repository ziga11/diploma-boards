import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
        resolve: {
                alias: {
                        '@': resolve(__dirname, './src'),
                },
        },
        /* plugins: [
                {
                        name: 'html-rewrite',
                        configureServer(server) {
                                server.middlewares.use((req, _, next) => {
                                        if (req.url === '/' || req.url === '/index.html') {
                                                req.url = '/pages/dashboard.html';
                                        }
                                        else if (req.url === '/board') {
                                                req.url = '/pages/board.html';
                                        }
                                        else if (req.url === '/login') {
                                                req.url = '/pages/login.html';
                                        }
                                        next();
                                });
                        }
                }
        ], */
        /* build: {
                outDir: 'dist',
                rollupOptions: {
                        input: {
                                dashboard: resolve(__dirname, 'pages/dashboard.html'),
                                board: resolve(__dirname, 'pages/board.html'),
                                login: resolve(__dirname, 'pages/login.html'),
                                not_found: resolve(__dirname, 'pages/404.html'),
                        },
                },
        }, */
});
