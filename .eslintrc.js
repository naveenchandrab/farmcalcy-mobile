module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'import', 'react', 'react-hooks', 'react-native'],
  settings: {
    // Alias resolution is provided by the babel module-resolver (babel.config.js).
    // The `typescript` resolver is intentionally not configured here because its
    // package is not installed; `plugin:import/typescript` already teaches the
    // import plugin about TS extensions and type-only imports.
    'import/resolver': {
      'babel-module': {},
    },
  },
  rules: {
    // The shared `@react-native` (0.76) config enables a handful of stylistic
    // rules that were removed from `@typescript-eslint` v8 (the version installed
    // here). They are delegated to Prettier anyway, so disable the stale
    // references to keep ESLint from erroring on a missing rule definition.
    '@typescript-eslint/func-call-spacing': 'off',
    '@typescript-eslint/no-extra-semi': 'off',

    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',

    // React
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Imports
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-duplicates': 'error',
    // `import/namespace` cannot parse React Native's Flow-typed entry point and
    // recurses through barrel re-exports, producing false positives on every
    // file that imports from `react-native`. Type safety is already enforced by
    // TypeScript, so this rule is disabled (standard practice in RN projects).
    'import/namespace': 'off',

    // General
    // `no-floating-promises` (error) requires `void` to mark intentional
    // fire-and-forget calls, so disable the conflicting `no-void` warning that
    // a shared config turns on. The codebase uses the `void` idiom throughout.
    'no-void': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: ['node_modules/', 'android/', 'ios/', '*.config.js', 'babel.config.js', 'metro.config.js'],
};
