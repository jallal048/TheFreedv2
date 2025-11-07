/**
 * Configuración específica de ESLint para optimizaciones de desarrollo en TheFreed.v1
 * Enfocado en performance, buenas prácticas y detección de problemas de optimización
 */

module.exports = {
  rules: {
    // Performance Rules
    'no-loop-infinite': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // React Performance Rules
    'react/jsx-no-bind': 'warn',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger': 'warn',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-is-mounted': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-unescaped-entities': 'warn',
    'react/no-unknown-property': 'error',
    'react/react-in-jsx-scope': 'error',
    'react/require-render-return': 'error',
    'react/style-prop-object': 'error',
    
    // React Hooks Performance
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    
    // Import Performance Rules
    'import/no-unresolved': 'off', // Handled by TypeScript
    'import/named': 'off', // Handled by TypeScript
    'import/default': 'off', // Handled by TypeScript
    'import/no-absolute-path': 'error',
    'import/no-dynamic-require': 'warn',
    'import/no-internal-modules': 'off',
    'import/no-webpack-loader-syntax': 'error',
    'import/no-self-import': 'error',
    'import/no-cycle': 'warn',
    'import/no-useless-path-segments': 'error',
    'import/export': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-deprecated': 'warn',
    'import/no-extraneous-dependencies': 'error',
    'import/no-mutable-exports': 'error',
    'import/prefer-default-export': 'off',
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }],
    
    // TypeScript Performance Rules
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': ['error', {
      default: 'array-simple'
    }],
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-ignore': 'allow-with-description'
    }],
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict for React
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    
    // Optimization-specific rules
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'no-var': 'error',
    'no-useless-escape': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-alert': 'error',
    'no-confirm': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'warn',
    'no-extra-label': 'warn',
    'no-implicit-coercion': 'warn',
    'no-implicit-globals': 'error',
    'no-invalid-this': 'error',
    'no-iterator': 'error',
    'no-label-var': 'error',
    'no-lone-blocks': 'warn',
    'no-loop-func': 'error',
    'no-magic-numbers': 'off', // Too restrictive for React apps
    'no-multi-strings': 'warn',
    'no-native-reassign': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',
    'no-unused-vars': ['error', {
      args: 'none',
      ignoreRestSiblings: true,
      vars: 'all'
    }],
    'no-use-before-define': ['error', {
      functions: false,
      classes: true,
      variables: true
    }],
    'no-useless-call': 'warn',
    'no-useless-computed-key': 'warn',
    'no-useless-return': 'warn',
    'prefer-promise-reject-errors': 'warn',
    'radix': 'error',
    'require-await': 'error',
    'spaced-comment': ['warn', 'always', {
      exceptions: ['-', '+'],
      markers: ['/', '!']
    }],
    'yoda': 'error',
    
    // Object/Array performance
    'prefer-object-spread': 'warn',
    'prefer-destructuring': ['warn', {
      array: true,
      object: true
    }],
    'object-shorthand': 'warn',
    'quote-props': ['warn', 'as-needed'],
    
    // String performance
    'prefer-template': 'warn',
    
    // Function performance
    'arrow-body-style': ['warn', 'as-needed'],
    'arrow-parens': ['warn', 'as-needed'],
    'consistent-return': 'error',
    'func-names': 'off',
    'func-style': ['warn', 'expression'],
    'no-empty-function': 'warn',
    'no-param-reassign': 'error',
    'prefer-arrow-callback': 'warn',
    
    // Error handling
    'handle-callback-err': 'error',
    
    // ES6+ features
    'arrow-spacing': 'error',
    'no-confusing-arrow': 'error',
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-const': 'error',
    'prefer-destructuring': ['warn', {
      array: false,
      object: true
    }],
    'prefer-numeric-literals': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',
    'prefer-template': 'warn',
    'rest-spread-spacing': 'error',
    'template-curly-spacing': 'error',
    'yield-star-spacing': 'error',
  },
  
  // Environment-specific configurations
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  
  // Parser configuration
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  
  // Plugin configuration
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'import',
  ],
  
  // Settings
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: 'tsconfig.json',
      },
    },
  },
  
  // Ignore patterns
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'build/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
    'reports/',
    'analysis/',
  ],
};