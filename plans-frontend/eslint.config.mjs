import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';

import tseslint from 'typescript-eslint';
import importXPlugin from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import promisePlugin from 'eslint-plugin-promise';
import unicornPlugin from 'eslint-plugin-unicorn';
import reactPlugin from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import reactCompiler from 'eslint-plugin-react-compiler';
import sonarjs from 'eslint-plugin-sonarjs';

export default tseslint.config(
  { ignores: ['**/reportWebVitals.ts', '**/react-app-env.d.ts', 'dist', 'build'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  promisePlugin.configs['flat/recommended'],
  importXPlugin.flatConfigs.recommended,
  importXPlugin.flatConfigs.typescript,
  jsxA11y.flatConfigs.recommended,
  unicornPlugin.configs['flat/recommended'],
  prettierPlugin,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2020 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      'react-compiler': reactCompiler
    },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': {
        typescript: true
      }
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules, // Automatically disables react-in-jsx-scope

      // React Hooks & Refresh
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Import Sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Unicorn Overrides (reducing noise for common React patterns)
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',

      'react-compiler/react-compiler': 'error',

      camelcase: 'warn',
      'spaced-comment': 'error',

      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true
          },
          ignore: ['^vite-env\\.d\\.ts$', '^vite\\.config\\.js$', '^eslint\\.config\\.mjs$']
        }
      ]
    }
  }
);
