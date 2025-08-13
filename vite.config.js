// vite.config.js
// import { defineConfig } from 'vite'

// export default defineConfig({
//   base: '/Minesweeper_AI/',
// })
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/Minesweeper_AI/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});