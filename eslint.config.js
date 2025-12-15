// ESLint v9 flat config
import functional from "eslint-plugin-functional";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Functional recommended preset
  functional.configs.recommended,
  // Project-specific tweaks
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module"
    },
    rules: {
      // Disable type-aware rule for JS-only project
      "functional/no-return-void": "off",
      // Disable type preference rule that requires TS type information
      "functional/prefer-immutable-types": "off",
      // Disable type-aware immutable data checks (JS-only)
      "functional/immutable-data": "off",
      // Slightly relax let usage
      "functional/no-let": "warn"
    },
  },
  // Relax expression statement rule in tests and build config
  {
    files: ["**/*.test.js"],
    rules: {
      "functional/no-expression-statements": "off"
    }
  }
];
