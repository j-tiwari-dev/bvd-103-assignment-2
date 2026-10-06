import globals from "globals";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  // 1. Base recommended configurations
  {
    files: ["**/*.ts"], // Apply these rules to all TypeScript files
    extends: [
      ...tseslint.configs.recommended, // Uses rules from '@typescript-eslint/eslint-plugin'
    ],
  },
  
  // 2. Prettier integration
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error", // Your rule: 'prettier/prettier': 'error'
    },
  },
  
  // 3. Configuration to disable Prettier/ESLint conflicts
  prettierConfig,

  // 4. Your custom rules and environment settings
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node, // Your setting: env: { node: true }
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Your rule: '@typescript-eslint/no-explicit-any': 'off'
    },
  },
];