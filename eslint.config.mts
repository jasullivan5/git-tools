// eslint.config.ts
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import { configs as tseslintConfigs } from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { configs as sonarjsConfigs } from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import prettier from "eslint-config-prettier";
import { FlatCompat } from "@eslint/eslintrc";
import vitest from "eslint-plugin-vitest";
import n from "eslint-plugin-n";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default defineConfig(
  {
    ignores: ["./node_modules", "./dist"],
    languageOptions: {
      globals: globals.node,
    },
    // typed as a generic settings bag; eslint doesn't ship a strict type here
    settings: { "import/resolver": { typescript: true, node: true } },
  },
  {
    files: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"],
    extends: [js.configs.recommended],
  },
  {
    files: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"],
    extends: [
      tseslintConfigs.strictTypeChecked,
      tseslintConfigs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
  {
    files: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"],
    extends: [
      n.configs["flat/recommended"],
      sonarjsConfigs.recommended,
      unicorn.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      compat.extends(
        "plugin:security/recommended-legacy",
        "plugin:promise/recommended",
      ),
    ],
    rules: {
      "unicorn/no-null": "off",
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-object-injection": "off",
    },
  },
  {
    files: ["./**/*.test.*"],
    extends: [vitest.configs.recommended],
    languageOptions: {
      // vitest plugin exposes an env bag with globals; it's fine to pass through
      globals: vitest.environments.env.globals,
    },
  },
  {
    files: ["**/*.json"],
    language: "json/json",
    extends: [json.configs.recommended],
  },
  {
    files: ["**/*.md"],
    language: "markdown/gfm",
    extends: [markdown.configs.recommended],
  },
  {
    files: ["**/*.{json,md,js,cjs,mjs,jsx,ts,cts,mts,tsx}"],
    extends: [prettier],
  },
);
