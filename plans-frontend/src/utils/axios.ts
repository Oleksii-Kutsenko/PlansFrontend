import { keysToCamel, keysToSnake } from './caseUtils';

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import store, { setToken, logout } from '../store';

export const fetcher = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

fetcher.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.data && !(config.data instanceof FormData)) {
    config.data = keysToSnake(config.data);
  }
  if (config.params) {
    config.params = keysToSnake(config.params);
  }
  return config;
});

fetcher.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.Authorization = authHeader();
  console.debug(
    '[Request]',
    config.method,
    config.baseURL,
    config.url,
    JSON.stringify(config.headers.Authorization)
  );
  return config;
});

function authHeader(): string {
  const token = store.getState().auth?.token;
  return `Bearer ${token}`;
}

fetcher.interceptors.response.use((res) => {
  if (res.data && typeof res.data === 'object') {
    res.data = keysToCamel(res.data);
  }
  return res;
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

fetcher.interceptors.response.use(
  (res: AxiosResponse<InternalAxiosRequestConfig, AxiosError>) => {
    if (res.config.baseURL && res.config.url) {
      console.debug('[Response]', res.config.baseURL + res.config.url, res.status, res.data);
    }
    return res;
  },
  async (err: AxiosError) => {
    const originalConfig = err.config as CustomAxiosRequestConfig;
    if (originalConfig) {
      console.debug(
        '[Response]',
        originalConfig.baseURL,
        originalConfig.url,
        err.response?.status,
        err.response?.data
      );
      if (err.response?.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;
        try {
          await refreshAuthLogic(err);
          // Original request headers will be updated with the new token by authHeader()
          // when the request is retried since we didn't statically set it in originalConfig
          return fetcher(originalConfig);
        } catch (refreshErr) {
          if (refreshErr instanceof Error) {
            return Promise.reject(refreshErr);
          }
          return Promise.reject(new Error(String(refreshErr)));
        }
      }
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);

const refreshAuthLogic = async (error: AxiosError) => {
  const { refreshToken } = store.getState().auth;
  if (refreshToken && error.response?.config.headers) {
    try {
      // Use axios.post instead of fetcher.post to avoid hitting the interceptor again and causing an infinite loop
      const resp = await axios.post(`${import.meta.env.VITE_API_URL}/api/accounts/refresh/`, {
        refresh: refreshToken
      });
      const { access, refresh } = resp.data as { access: string; refresh: string };
      console.log('Refreshed token:', access, refresh);
      error.response.config.headers.Authorization = `Bearer ${access}`;
      store.dispatch(setToken({ access, refresh }));
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        store.dispatch(logout());
      }
      throw err;
    }
  } else {
    store.dispatch(logout());
    throw new Error('No refresh token available');
  }
};
