import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: ['lib/**', 'node_modules/**', '*.js', '*.mjs'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.config.ts'],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
