import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import json from '@eslint/json';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import vueParser from 'vue-eslint-parser';
import babelParser from '@babel/eslint-parser';

// Clean up buggy globals
function trimGlobals(globals) {
  const cleaned = {};
  for (const [key, value] of Object.entries(globals)) {
    cleaned[key.trim()] = value;
  }
  return cleaned;
}

const combinedGlobals = trimGlobals({
  ...globals.browser,
  ...globals.node,
});

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: babelParser,
        ecmaVersion: 2021,
        sourceType: 'module',
        requireConfigFile: false,
      },
      globals: combinedGlobals,
    },
    plugins: {
      js,
      vue: pluginVue,
    },
    rules: {
      ...pluginVue.configs['flat/essential'].rules,
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
]);
