import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Replace import.meta.env references with actual string values
      'import.meta.env.GUESTBOOK_COLLECTION_ID': JSON.stringify(env.GUESTBOOK_COLLECTION_ID || '69383a09bbf502930bf620a3'),
      'import.meta.env.BASE_URL': JSON.stringify(env.BASE_URL || '/guestbook-form'),
      // Replace process.env.NODE_ENV for React
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'embed/guestbook-embed.tsx'),
        name: 'GuestbookEmbed',
        fileName: 'guestbook-embed',
        formats: ['iife']
      },
      outDir: 'public',
      rollupOptions: {
        output: {
          // Single file bundle with everything inlined
          inlineDynamicImports: true,
          assetFileNames: 'guestbook-embed.[ext]',
        }
      },
      // Ensure CSS is bundled
      cssCodeSplit: false,
      // Minify for production
      minify: 'terser',
      terserOptions: {
        compress: {
          // Remove console logs in production
          drop_console: false,
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  };
});
