/**
 * Jest configuration for FarmCalcy.
 *
 * Layered on the official `react-native` preset, this config wires up:
 *  - the same `@`-aliases used by Babel/TypeScript (so tests import like app code)
 *  - a single setup file (`jest.setup.js`) that mocks every native module the
 *    auth flow touches (Keychain, AsyncStorage, Reanimated, vector-icons, …)
 *  - coverage collection + thresholds focused on the auth feature and the
 *    shared services/store it depends on.
 *
 * Run:  npm test            → full suite
 *       npm run test:auth   → auth feature only
 *       npm run test:coverage
 */

/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Mirrors babel.config.js + tsconfig path aliases so test files can use them.
  moduleNameMapper: {
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@constants$': '<rootDir>/src/constants/index.ts',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@app-types$': '<rootDir>/src/types/index.ts',
    '^@app-types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@test-utils$': '<rootDir>/src/test-utils/index.ts',
    '^@test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
    '^@design-system$': '<rootDir>/src/design-system/index.ts',
    '^@design-system/(.*)$': '<rootDir>/src/design-system/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // The RN ecosystem ships untranspiled ESM; allow Babel to transform it.
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        'react-native',
        '@react-native',
        '@react-navigation',
        'react-native-vector-icons',
        'react-native-keychain',
        'react-native-config',
        'react-native-mmkv',
        'react-native-gesture-handler',
        'react-native-reanimated',
        'react-native-safe-area-context',
        'react-native-screens',
        '@testing-library',
      ].join('|') +
      ')/)',
  ],

  // ─── Coverage ────────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    'src/features/auth/**/*.{ts,tsx}',
    'src/services/{TokenService,ApiErrorMapper}.ts',
    'src/store/authStore.ts',
    'src/api/interceptors.ts',
    // Exclusions: presentational-only / generated / barrels.
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
    '!src/features/auth/screens/RegisterScreen.tsx',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],

  // Enforced thresholds — the suite fails CI if coverage regresses below these.
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },

  clearMocks: true,
  resetMocks: false,
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  // Speeds up local runs by ignoring the native build folders.
  modulePathIgnorePatterns: ['<rootDir>/android', '<rootDir>/ios'],
};
