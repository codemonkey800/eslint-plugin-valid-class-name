import { RuleTester } from "eslint";
import rule from "./valid-class-name.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

// Test valid configurations - these should all pass
ruleTester.run("valid-class-name schema - valid configurations", rule, {
  valid: [
    {
      code: "<div />",
      filename: "test.jsx",
      options: [{}],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          sources: {
            css: ["**/*.css"],
          },
        },
      ],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          sources: {
            scss: ["**/*.scss", "styles/**/*.sass"],
          },
        },
      ],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          sources: {
            tailwind: true,
          },
        },
      ],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          sources: {
            tailwind: false,
          },
        },
      ],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          sources: {
            tailwind: {
              config: "./tailwind.config.js",
            },
          },
        },
      ],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          sources: {
            cssModules: true,
          },
        },
      ],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          sources: {
            cssModules: false,
          },
        },
      ],
    },
    {
      code: '<div className="custom-btn" />',
      filename: "test.jsx",
      options: [
        {
          validation: {
            whitelist: ["custom-*", "app-*"],
          },
        },
      ],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          validation: {
            blacklist: ["legacy-*", "deprecated-*"],
          },
        },
      ],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          validation: {
            ignorePatterns: ["dynamic-*", "state-*"],
          },
        },
      ],
    },
    {
      code: '<div className="custom-class" />',
      filename: "test.jsx",
      options: [
        {
          sources: {
            css: ["**/*.css"],
            scss: ["**/*.scss"],
            tailwind: {
              config: "./tailwind.config.js",
            },
            cssModules: true,
          },
          validation: {
            whitelist: ["custom-*"],
            blacklist: ["legacy-*"],
            ignorePatterns: ["dynamic-*"],
          },
        },
      ],
    },
    {
      code: "<div />",
      filename: "test.jsx",
      options: [
        {
          sources: {
            css: [],
            scss: [],
          },
          validation: {
            whitelist: [],
            blacklist: [],
            ignorePatterns: [],
          },
        },
      ],
    },
  ],
  invalid: [],
});
