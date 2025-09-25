import globals from "globals";
import js from "@eslint/js";

export default [
  // ESLintの推奨ルールを適用
  js.configs.recommended,
  // Ignore patterns for directories and files that shouldn't be linted
  {
    ignores: [
      "android/**/*",
      "android.backup/**/*",
      "android_backup_*/**/*",
      "dist/**/*",
      "node_modules/**/*"
    ]
  },
  // すべてのJSファイルにブラウザ環境を適用
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node.js globals for module compatibility
        Capacitor: "readonly", // Capacitor framework
        displayDataLoadError: "readonly", // Custom UI function
        hideDataLoadError: "readonly", // Custom UI function
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          args: "none",
          varsIgnorePattern: "^_|showScreen",
          caughtErrors: "none",
        },
      ],
    },
  },
  // sw.jsファイルには特別にサービスワーカー環境を適用
  {
    files: ["**/sw.js"],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
];
