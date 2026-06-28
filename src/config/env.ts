import Config from 'react-native-config';

type AppEnv = 'development' | 'staging' | 'production';

interface AppConfig {
  /** Base URL for the NestJS REST API, without trailing slash. */
  readonly BASE_URL: string;
  /** Current deployment environment. */
  readonly APP_ENV: AppEnv;
  readonly isDev: boolean;
  readonly isStaging: boolean;
  readonly isProd: boolean;
}

const resolveConfig = (): AppConfig => {
  const baseUrl = Config.BASE_URL;
  const rawEnv = Config.APP_ENV ?? 'development';

  if (!baseUrl) {
    throw new Error(
      '[FarmCalcy] BASE_URL is not defined. ' +
        'Check your .env.* file and rebuild the native bundle.',
    );
  }

  const appEnv = rawEnv;

  return {
    BASE_URL: baseUrl.replace(/\/$/, ''), // strip accidental trailing slash
    APP_ENV: appEnv,
    isDev: appEnv === 'development',
    isStaging: appEnv === 'staging',
    isProd: appEnv === 'production',
  };
};

/**
 * Typed, validated access to all environment variables.
 * Import this instead of `Config` directly so the whole app
 * benefits from strict typing and the early validation error.
 */
export const appConfig: AppConfig = resolveConfig();
