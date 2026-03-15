// eslint.config.mjs
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // General configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,astro}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Recommended JavaScript and TypeScript configurations
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // Recommended Astro configuration
  ...eslintPluginAstro.configs.recommended,

  // Specific configuration for Astro files
  {
    files: ["*.astro"],
    parser: "astro-eslint-parser",
    languageOptions: {
      // Parse the script in `.astro` as TypeScript
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      // Override or add specific Astro rules here, e.g:
      // "astro/no-set-html-directive": "error"
    },
  },

  // Optional: If using the jsx-a11y plugin
  // ...eslintPluginAstro.configs["jsx-a11y-recommended"],
];
