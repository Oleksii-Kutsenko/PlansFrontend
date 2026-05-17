import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

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
    plugins: {
      react,
      'react-hooks': fixupPluginRules(reactHooks),
      '@typescript-eslint': typescriptEslint,
      prettier,
      import: importPlugin
    },

    languageOptions: {
      globals: {
        ...globals.browser
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true
        }
      }
    },

    settings: {
      react: {
        version: 'detect'
      },

      'import/resolver': {
        typescript: {}
      }
    },

    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': 'error',
      camelcase: 'warn',
      'spaced-comment': 'error',

      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: true
        }
      ],
      'import/newline-after-import': ['error', { count: 1 }]
    }
  }
];
