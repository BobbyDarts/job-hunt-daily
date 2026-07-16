// /vite.config.ts

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "node:path";
import { defineConfig } from "vitest/config";
import { version } from "./package.json";

export default defineConfig({
  plugins: [vue(), vueJsx(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/main.ts",
        "**/*.d.ts",
        "src/components/ui/**",
        "src/components/app/**/index.ts",
        "src/composables/**/index.ts",
        "src/lib/index.ts",
        "src/test/index.ts",
        "src/test-utils/index.ts",
        "src/types/index.ts",
        "src/views/index.ts",
      ],
    },
  },
});
