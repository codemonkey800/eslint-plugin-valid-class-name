import type { Rule } from 'eslint'
import validClassName from 'src/rules/valid-class-name'

export const rules: Record<string, Rule.RuleModule> = {
  'valid-class-name': validClassName,
}
