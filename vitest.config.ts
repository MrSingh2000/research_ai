import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig((env) => {
  if (env.mode === "int") {
    return {
      test: {
        testTimeout: 100_000,
        include: ["test/**/*.int.test.ts"],
        setupFiles: ["dotenv/config", "vitest.setup.ts"],
      },
    };
  }

  return {
    test: {
      testTimeout: 30_000,
      exclude: ["test/**/*.int.test.ts", ...configDefaults.exclude],
    },
  };
});
