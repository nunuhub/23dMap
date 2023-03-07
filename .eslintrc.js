module.exports = {
  globals: {
    chrome: true
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'no-debugger': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-restricted-globals': ['error', 'event', 'fdescribe'],
    'vue/require-default-prop': 'off'
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true
    }
  }
};
