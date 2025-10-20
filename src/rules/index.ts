import type { Rule } from "eslint";
import validClassName from "./valid-class-name.js";

export const rules: Record<string, Rule.RuleModule> = {
  "valid-class-name": validClassName,
};
