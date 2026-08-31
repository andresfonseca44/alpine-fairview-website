import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        quote: resolve(__dirname, 'quote.html'),
        wholeLife: resolve(__dirname, 'whole-life-policies.html'),
        careers: resolve(__dirname, 'careers.html'),
        carriers: resolve(__dirname, 'carriers.html'),
        aboutUs: resolve(__dirname, 'about-us.html'),
        privacyPolicy: resolve(__dirname, 'privacy-policy.html'),
        termsOfUse: resolve(__dirname, 'terms-of-use.html'),
        thankYou: resolve(__dirname, 'thank-you.html')
      }
    }
  }
});
