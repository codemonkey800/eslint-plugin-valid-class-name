import type { ESLint } from 'eslint';
import { rules } from './rules/index.js';

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-valid-class-name',
    version: '0.1.0',
  },
  rules,
  configs: {
    recommended: {
      plugins: ['valid-class-name'],
      rules: {
        'valid-class-name/valid-class-name': 'error',
      },
    },
  },
};

export default plugin;
