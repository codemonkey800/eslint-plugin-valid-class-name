import * as vueParser from 'vue-eslint-parser'
import validClassName from 'eslint-plugin-valid-class-name'

export default [
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      'valid-class-name': validClassName,
    },
    rules: {
      'valid-class-name/valid-class-name': [
        'error',
        {
          sources: {
            css: ['src/styles/**/*.css'],
            scss: ['src/styles/**/*.scss'],
            tailwind: true,
          },
          validation: {
            ignorePatterns: ['dynamic-*', 'custom-*'],
          },
        },
      ],
    },
  },
]
