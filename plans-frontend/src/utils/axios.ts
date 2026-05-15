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

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

fetcher.interceptors.response.use(
  (res: AxiosResponse<InternalAxiosRequestConfig, AxiosError>) => {
    if (res.config.baseURL && res.config.url) {
      console.debug('[Response]', res.config.baseURL + res.config.url, res.status, res.data);
    }
    return res;
  },
  async (err: AxiosError) => {
    const originalRequest = err.config;

    if (originalRequest) {
      console.debug(
        '[Response]',
        originalRequest.baseURL,
        originalRequest.url,
        err.response?.status,
        err.response?.data
      );

      if (
        err.response?.status === 401 &&
        !originalRequest.url?.includes('/api/accounts/refresh/')
      ) {
        if (isRefreshing) {
          try {
            const token = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = `Bearer ${String(token)}`;
            return fetcher(originalRequest);
          } catch (queueErr) {
            const finalError = queueErr instanceof Error ? queueErr : new Error('Queue failed');
            return Promise.reject(finalError);
          }
        }

        isRefreshing = true;

        try {
          const { refreshToken } = store.getState().auth;
          if (!refreshToken) {
            store.dispatch(logout());
            return Promise.reject(err);
          }

          const resp = await axios.post(`${import.meta.env.VITE_API_URL}/api/accounts/refresh/`, {
            refresh: refreshToken
          });
          const { access, refresh } = resp.data as { access: string; refresh: string };
          console.log('Refreshed token:', access, refresh);
          store.dispatch(setToken({ access, refresh }));
          originalRequest.headers.Authorization = `Bearer ${access}`;
          processQueue(null, access);
          return fetcher(originalRequest);
        } catch (refreshErr: unknown) {
          if (axios.isAxiosError(refreshErr) && refreshErr.response?.status === 401) {
            store.dispatch(logout());
          }
          const finalError = refreshErr instanceof Error ? refreshErr : new Error('Refresh failed');
          processQueue(finalError, null);
          return Promise.reject(finalError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(err);
  }
);
