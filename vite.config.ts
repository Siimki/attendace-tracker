import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      __APP_TIMEZONE__: JSON.stringify(env.VITE_TIMEZONE ?? 'Europe/Tallinn'),
    },
    server: {
      host: true,
      port: 5173,
    },
    preview: {
      host: true,
      port: 5173,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  };
});
