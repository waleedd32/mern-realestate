import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/server": {
        target: "http://localhost:3000",
        secure: false,
      },
    },
  },

  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
