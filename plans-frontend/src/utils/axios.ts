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

fetcher.interceptors.response.use(
  (res: AxiosResponse<InternalAxiosRequestConfig, AxiosError>) => {
    if (res.config.baseURL && res.config.url) {
      console.debug('[Response]', res.config.baseURL + res.config.url, res.status, res.data);
    }
    return res;
  },
  async (err: AxiosError) => {
    if (err?.config) {
      console.debug(
        '[Response]',
        err.config.baseURL,
        err.config.url,
        err.response?.status,
        err.response?.data
      );
      if (err.response?.status === 401) {
        await refreshAuthLogic(err);
      }
      return Promise.reject(err);
    }
  }
);

const refreshAuthLogic = async (error: AxiosError) => {
  const { refreshToken } = store.getState().auth;
  if (refreshToken && error.response?.config.headers) {
    try {
      const resp = await fetcher.post('/api/accounts/refresh/', {
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
    }
  } else {
    store.dispatch(logout());
  }
};
