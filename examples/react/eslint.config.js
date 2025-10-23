import tseslint from 'typescript-eslint'
import validClassName from 'eslint-plugin-valid-class-name'

export default tseslint.config(
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
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
            whitelist: ['custom-*'],
            ignorePatterns: ['dynamic-*'],
          },
        },
      ],
    },
  },
)
