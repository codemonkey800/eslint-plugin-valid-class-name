import type { Rule } from 'eslint'

import { validClassNameRule } from './valid-class-name'

export const rules: Record<string, Rule.RuleModule> = {
  'valid-class-name': validClassNameRule,
}
