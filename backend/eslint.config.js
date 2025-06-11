// backend/eslint.config.js
import js from '@eslint/js';
import pluginNode from 'eslint-plugin-node';
import pluginSecurity from 'eslint-plugin-security';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

// Trim buggy global keys
function trimGlobals(globals) {
  const cleaned = {};
  for (const [key, value] of Object.entries(globals)) {
    cleaned[key.trim()] = value;
  }
  return cleaned;
}

const combinedGlobals = trimGlobals({
  ...globals.node,
});

export default defineConfig([
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: combinedGlobals,
    },
    plugins: {
      js,
      node: pluginNode,
      security: pluginSecurity,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Logging is OK in backend
      'security/detect-object-injection': 'off', // Optional: turn off if too strict
    },
  },
]);
