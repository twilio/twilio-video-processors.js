const globals = require("globals");
const pluginJs = require("@eslint/js");
const tseslint = require("typescript-eslint");


module.exports = [
  { files: ["lib/**/*.ts"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-namespace": "warn",
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
];
