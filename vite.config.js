import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    terserOptions: {
      format: {
        // Remove all comments 
        comments: false,
      },
    },
    // comments wont be saved anywhere
    extractComments: false,
  },
    esbuild: {
    drop: ['console', 'debugger'], // removes console.* and debugger
  },
});
