import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/ziba/",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Increase chunk size warning limit (images are served as separate files now)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor chunks to enable long-term caching
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "motion": ["framer-motion"],
          "icons": ["lucide-react"],
        },
        // Asset file naming with content hash for cache busting
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
    // Inline nothing — all assets served as separate files
    assetsInlineLimit: 0,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Source maps only in dev
    sourcemap: false,
  },
});
