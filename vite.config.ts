import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target = (process.env.RANKYPULSE_APP_URL || "https://rankypulse.com").replace(/\/+$/, "");

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target, changeOrigin: true, secure: true },
      "/audit": { target, changeOrigin: true, secure: true },
      "/pricing": { target, changeOrigin: true, secure: true },
      "/auth": { target, changeOrigin: true, secure: true },
      "/dashboard": { target, changeOrigin: true, secure: true },
      "/billing": { target, changeOrigin: true, secure: true }
    }
  }
});
