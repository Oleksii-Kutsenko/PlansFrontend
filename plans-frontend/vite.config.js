import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: 'styles', replacement: path.resolve(__dirname, 'src/styles') },
        {
          find: 'modules',
          replacement: path.resolve(__dirname, 'src/modules')
        },
        { find: 'assets', replacement: path.resolve(__dirname, 'src/assets') },
        {
          find: '~bootstrap',
          replacement: path.resolve(__dirname, 'node_modules/bootstrap')
        }
      ]
    },
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'build'
    },
    plugins: [react()]
  };
});
