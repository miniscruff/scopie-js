import globals from "globals";
import pluginJs from "@eslint/js";
import pluginJest from "eslint-plugin-jest";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ...pluginJs.configs.recommended,
    // files: ['src/*.js'],
    // ignores: ['src/*.bench.js'],
    plugins: {
      jest: pluginJest
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
];
