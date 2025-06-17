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
});
