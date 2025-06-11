// backend/eslint.config.cjs
const js = require('@eslint/js');
const pluginNode = require('eslint-plugin-node');
const pluginSecurity = require('eslint-plugin-security');
const globals = require('globals');

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

module.exports = [
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
      'no-console': 'off',
      'security/detect-object-injection': 'off',
    },
  },
];
