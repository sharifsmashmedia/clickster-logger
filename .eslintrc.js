module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'no-console': 'error',
    'comma-dangle': ['error', 'never'],
    'one-var': ['error', 'consecutive'],
    'no-else-return': 'off',
    'class-methods-use-this': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-expressions': 'off'
  },
};
