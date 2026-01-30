import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier/recommended";
import vitestPlugin from "eslint-plugin-vitest";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default tseslint.config(
  // -------------------------
  // Base recommended configs
  // -------------------------
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // -------------------------
  // Vue files: Vue SFC parsing
  // -------------------------
  {
    files: ["**/*.vue"],
    plugins: {
      vue: pluginVue,
    },
    languageOptions: {
      parser: vueParser, // ⚠ Must be vue-eslint-parser
      parserOptions: {
        parser: tseslint.parser, // TypeScript parser inside Vue
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      /**
       * ======================
       * Vue-specific rules
       * ======================
       */

      // ❌ Default: "error"
      // Enforces multi-word component names (except App) to avoid conflicts with HTML elements.
      "vue/multi-word-component-names": "off",

      // ❌ Default: "off"
      // Prevents mutating state or causing side effects inside computed properties.
      // Computeds should be pure and deterministic.
      "vue/no-side-effects-in-computed-properties": "error",

      // ❌ Default: "off"
      // Requires a unique :key on elements rendered with v-for.
      // Prevents rendering bugs and improves diffing performance.
      "vue/require-v-for-key": "error",

      // ❌ Default: "off"
      // Enforces consistent order of top-level blocks in single-file components.
      // Recommended order: script → template → style.
      "vue/block-order": ["warn", { order: ["script", "template", "style"] }],

      // ❌ Default: "error"
      // Disables the restriction preventing destructuring of props in <script setup>.
      // Safe with Vue 3.3+ and TypeScript; allows destructuring for convenience.
      "vue/no-setup-props-destructure": "off",

      // ❌ Default: "off"
      // Enforces a consistent order for Vue macros in <script setup>.
      // Recommended: defineProps → defineEmits → defineSlots → defineExpose
      "vue/define-macros-order": [
        "error",
        {
          order: ["defineProps", "defineEmits", "defineSlots", "defineExpose"],
        },
      ],

      // ❌ Default: "off"
      // Requires macro variables to follow conventional naming.
      // e.g., props = defineProps(), emit = defineEmits()
      "vue/require-macro-variable-name": "error",
    },
  },

  // -------------------------
  // All JS/TS/Vue files
  // -------------------------
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["**/*.config.ts", "**/*.config.js"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json", // type-aware
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.eslint.json",
        },
      },
    },
    rules: {
      /**
       * ======================
       * TypeScript rules
       * ======================
       */

      // ❌ Default: "off"
      // Warns when `any` is used explicitly.
      // Using "warn" keeps velocity while surfacing risky areas.
      "@typescript-eslint/no-explicit-any": "warn",

      // ❌ Default: "off"
      // Enforces `import type { Foo } from "./foo"` for type-only imports.
      // Improves clarity, tooling support, and tree-shaking.
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],

      // ❌ Default: "off"
      // Requires handling of promises (await or .then) to avoid unhandled rejections.
      "@typescript-eslint/no-floating-promises": "error",

      /**
       * ======================
       * General JavaScript rules
       * ======================
       */

      // ❌ Default: "off"
      // Requires `const` for variables that are never reassigned.
      // Reduces accidental mutation and improves readability.
      "prefer-const": "error",

      // ❌ Default: "off"
      // Disallows unused expressions (like `foo && bar();` without effect).
      // Catches dead code and accidental logic leftovers.
      "no-unused-expressions": "error",

      // Import plugin rules
      "import/order": [
        "warn",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-unresolved": "error",
      "import/no-duplicates": "error",
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    },
  },

  // -------------------------
  // Composables overrides
  // -------------------------
  {
    files: ["src/composables/**/*.{ts,js}"],
    rules: {
      // ❌ Default: "off"
      // Allow unused function arguments prefixed with `_`
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // -------------------------
  // Vitest test files
  // -------------------------
  {
    files: ["**/*.{test,spec}.{ts,js}"],
    ...vitestPlugin.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
    rules: {
      // ❌ Default: "off"
      // Allow unused function arguments prefixed with `_`
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Add a separate config for config files without type-aware linting
  {
    files: ["**/*.config.ts", "**/*.config.js"],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      // Add import rules here
      "import/order": [
        "warn",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },

  // -------------------------
  // Ignore generated / vendor / coverage files
  // -------------------------
  {
    ignores: [
      "dist/",
      "node_modules/",
      "vite.config.ts",
      "coverage/**",
      "notes/**",
      "src/components/ui/**",
    ],
  },

  // -------------------------
  // Prettier integration
  // -------------------------
  prettier,
);
