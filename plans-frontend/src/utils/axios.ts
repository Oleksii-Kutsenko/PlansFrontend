import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

import store, { logout, setToken } from '../store';
import { keysToCamel, keysToSnake } from './caseUtils';

export const fetcher = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    JSON.stringify(config.headers.Authorization),
  );
  return config;
});

function authHeader(): string {
  const token = store.getState().auth.token;
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

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  for (const prom of failedQueue) {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  }

  failedQueue = [];
};

const handleResponseError = async (err: AxiosError) => {
  const originalConfig = err.config as CustomAxiosRequestConfig;
  console.debug(
    '[Response]',
    originalConfig.baseURL,
    originalConfig.url,
    err.response?.status,
    err.response?.data,
  );

  if (err.response?.status === 401 && !originalConfig._retry) {
    if (isRefreshing) {
      try {
        const token = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        if (token && typeof token === 'string') {
          originalConfig.headers.Authorization = `Bearer ${token}`;
        }
        return await fetcher(originalConfig);
      } catch (error) {
        throw error instanceof Error ? error : new Error(String(error));
      }
    }

    originalConfig._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken } = store.getState().auth;
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const resp = await axios.post(`${import.meta.env.VITE_API_URL}/api/accounts/refresh/`, {
        refresh: refreshToken,
      });

      const { access, refresh } = resp.data as { access: string; refresh: string };
      console.log('Refreshed token:', access, refresh);

      store.dispatch(setToken({ access, refresh }));
      originalConfig.headers.Authorization = `Bearer ${access}`;

      processQueue(null, access);
      return await fetcher(originalConfig);
    } catch (error) {
      processQueue(error instanceof Error ? error : new Error(String(error)), null);
      store.dispatch(logout());
      throw error instanceof Error ? error : new Error(String(error));
    } finally {
      isRefreshing = false;
    }
  }
  throw err;
};

fetcher.interceptors.response.use((res: AxiosResponse<InternalAxiosRequestConfig, AxiosError>) => {
  if (res.config.baseURL && res.config.url) {
    console.debug('[Response]', res.config.baseURL + res.config.url, res.status, res.data);
  }
  return res;
}, handleResponseError);
