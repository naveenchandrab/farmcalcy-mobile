/**
 * Re-export the production testID registry so tests can import it from the
 * single `@test-utils` entry point. The canonical source is
 * `src/constants/testIDs.ts` (importable by production screens without pulling
 * test-only code into the app bundle).
 */
export { TEST_IDS, type TestIds } from '@constants/testIDs';
