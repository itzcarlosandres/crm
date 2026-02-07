import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Fix: Use '.' instead of process.cwd() to avoid TS error 'Property cwd does not exist on type Process'
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      // Bakes the API key into the code at build time for the frontend to use
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    }
  };
});