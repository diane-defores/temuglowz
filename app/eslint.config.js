import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/**",
      "dist-*/**",
      "node_modules/**",
      "src-tauri/target/**",
      "src-tauri/gen/android/.gradle/**",
      "src-tauri/gen/android/build/**",
      "src-tauri/gen/android/app/build/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["src/**/*.{ts,vue}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        parser: tseslint.parser,
        sourceType: "module",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "no-console": "warn",
      "no-unused-vars": "off",
    },
  },
];
