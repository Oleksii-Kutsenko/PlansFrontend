// import importPlugin from 'eslint-plugin-import';
// import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
// import typescriptEslint from '@typescript-eslint/eslint-plugin';
// import prettier from 'eslint-plugin-prettier';
// import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
// import tsParser from '@typescript-eslint/parser';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// import { FlatCompat } from '@eslint/eslintrc';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: js.configs.recommended,
//   allConfig: js.configs.all
// });

// export default [
//   ...compat.extends(
//     'eslint:recommended',
//     'plugin:react/recommended',
//     'plugin:@typescript-eslint/recommended',
//     'plugin:@typescript-eslint/recommended-type-checked',
//     'plugin:@typescript-eslint/stylistic-type-checked',
//     'prettier',
//     'plugin:prettier/recommended'
//   ),
//   {
//     plugins: {
//       react,
//       'react-hooks': fixupPluginRules(reactHooks),
//       '@typescript-eslint': typescriptEslint,
//       prettier,
//       import: importPlugin
//     },
//
//     languageOptions: {
//       globals: {
//         ...globals.browser
//       },
//
//       parser: tsParser,
//       ecmaVersion: 'latest',
//       sourceType: 'module',
//
//       parserOptions: {
//         project: true,
//         tsconfigRootDir: __dirname,
//         ecmaFeatures: {
//           jsx: true
//         }
//       }
//     },
//
//     settings: {
//       react: {
//         version: 'detect'
//       },
//
//       'import/resolver': {
//         typescript: {}
//       }
//     },
//
//     rules: {
//       'react/react-in-jsx-scope': 'off',
//       '@typescript-eslint/no-explicit-any': 'off',
//       'prettier/prettier': 'error',
//       camelcase: 'warn',
//       'spaced-comment': 'error',
//
//       quotes: [
//         'error',
//         'single',
//         {
//           allowTemplateLiterals: true
//         }
//       ],
//       'import/newline-after-import': ['error', { count: 1 }]
//     }
//   }
// ];
import tseslint from 'typescript-eslint';
import importXPlugin from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import promisePlugin from 'eslint-plugin-promise';
import unicornPlugin from 'eslint-plugin-unicorn';
import reactPlugin from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  { ignores: ['**/reportWebVitals.ts', '**/react-app-env.d.ts', 'dist', 'build'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  promisePlugin.configs['flat/recommended'],
  importXPlugin.flatConfigs.recommended,
  importXPlugin.flatConfigs.typescript,
  jsxA11y.flatConfigs.recommended,
  unicornPlugin.configs['flat/recommended'],
  prettierPlugin,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2020 },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules, // Automatically disables react-in-jsx-scope

      // React Hooks & Refresh
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Import Sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Type Overrides
      '@typescript-eslint/no-explicit-any': 'off',

      // Unicorn Overrides (reducing noise for common React patterns)
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',

      camelcase: 'warn',
      'spaced-comment': 'error',
      quotes: ['error', 'single', { allowTemplateLiterals: true }]
    }
  }
);
