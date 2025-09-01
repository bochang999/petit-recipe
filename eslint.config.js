import globals from "globals";
import js from "@eslint/js";

export default [
  // ESLintの推奨ルールを適用
  js.configs.recommended,
  // すべてのJSファイルにブラウザ環境を適用
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
      }
    }
  },
  // sw.jsファイルには特別にサービスワーカー環境を適用
  {
    files: ["sw.js"],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      }
    }
  }
];