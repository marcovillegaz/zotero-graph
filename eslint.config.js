import js from "@eslint/js";
import tseslint from "typescript-eslint";

const zoteroGlobal = { name: "Zotero", message: "Solo ZoteroAdapter y src/zotero pueden usar Zotero." };

export default tseslint.config(
  { ignores: ["node_modules", "build", ".scaffold", "graphify-out", "test-results", "playwright-report", "addon"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [".claude/**/*.mjs"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/core/**/*.ts"],
    rules: {
      "no-restricted-globals": ["error", zoteroGlobal],
      "no-restricted-imports": ["error", {
        patterns: [
          { regex: "^\\.\\.?/.*(view|adapters|zotero)", message: "core no depende de otras capas." },
          { regex: "^[^.]", message: "core no importa paquetes externos." },
        ],
      }],
    },
  },
  {
    files: ["src/view/**/*.ts"],
    rules: {
      "no-restricted-globals": ["error", zoteroGlobal],
      "no-restricted-imports": ["error", {
        patterns: [{ regex: "(zotero|zotero-adapter)", message: "La vista no conoce a Zotero." }],
      }],
    },
  },
  {
    files: ["src/zotero/**/*.ts", "src/adapters/zotero-adapter.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
);
