import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/videos': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/youtube': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
});
