import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/guardrails/**", "src/llm/**", "src/lib/search.ts"],
      exclude: ["src/tests/**", "src/index.ts", "src/lib/db.ts", "src/lib/qdrant.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
});
