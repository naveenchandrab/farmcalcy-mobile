import axios, { type AxiosInstance } from 'axios';

import { appConfig } from '@config/env';
import { API_TIMEOUT_MS } from '@constants';

/**
 * Singleton Axios instance shared by the entire application.
 *
 * Interceptors are attached separately in `interceptors.ts` and called
 * once at app startup from App.tsx. Keeping the client and interceptors
 * in separate files allows the client to be imported without pulling in
 * the interceptor logic (useful for unit tests).
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: appConfig.BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default apiClient;
