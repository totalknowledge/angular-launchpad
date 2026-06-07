const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: [
      'coverage/**',
      'node_modules/**',
      'target/**',
      'www/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
);
