import * as angularParser from '@angular-eslint/template-parser'
import validClassName from 'eslint-plugin-valid-class-name'

export default [
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularParser,
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
