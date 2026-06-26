/**
 * Augments react-native-config's NativeConfig with the env variables
 * defined in .env.* files. All values arrive as strings at runtime.
 */
declare module 'react-native-config' {
  export interface NativeConfig {
    BASE_URL?: string;
    APP_ENV?: 'development' | 'staging' | 'production';
  }

  export const Config: NativeConfig;
  export default Config;
}
