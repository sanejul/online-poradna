import eslintRecommended from "eslint/conf/eslint-recommended";
import reactPlugin from "eslint-plugin-react";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import prettierConfig from "eslint-config-prettier";
import { parser as typescriptParser } from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    environment: {
      browser: true,
      es2021: true,
      node: true,
    },
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": typescriptPlugin,
      prettier: prettierConfig,
    },
    rules: {
      ...eslintRecommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...typescriptPlugin.configs.recommended.rules,
      "prettier/prettier": ["warn"],
      "react/prop-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-inferrable-types": [
        "off",
        { "ignoreParameters": true },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
