import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./**/*.test.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"],
    globals: true,
    environment: "node",
  },
});
