import * as path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/scratch/',

  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src/js') }],
  },

  build: {
    target: 'esnext',
  },
});
