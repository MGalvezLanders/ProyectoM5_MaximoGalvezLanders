import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Config separada de vite.config.ts: Vitest la prioriza y NO mergea con
// vite.config, por eso replicamos el plugin de React y el alias "@".
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    clearMocks: true,
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "api/",
        "src/test/",
        "src/main.tsx",
        "**/*.config.*",
        "**/*.d.ts",
      ],
    },
  },
});
