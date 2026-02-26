import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  // 1. Global Ignores (Must be first, standalone object)
  { ignores: ['**/dist', '**/node_modules', '**/build'] },

  // 2. Base JavaScript & React Configurations
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  // 3. Environment & Settings
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser
      }
    },
    settings: {
      react: {
        version: 'detect' // Tells eslint-plugin-react to automatically detect your React version
      }
    }
  },

  // 4. Custom Plugin Rules (Hooks & Fast Refresh)
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,

      // Overrides from your preferred setup
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_' }] // Example: Ignore unused variables that start with an underscore
    }
  },

  // 5. Prettier Integration (Must always be absolute last to override conflicting formatting rules)
  eslintConfigPrettier
]
