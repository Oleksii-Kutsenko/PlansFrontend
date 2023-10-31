import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import store, { setToken, logout } from '../store';

export const fetcher = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

fetcher.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
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

fetcher.interceptors.response.use(
  async (res: AxiosResponse<InternalAxiosRequestConfig, any>) => {
    if (res.config.baseURL && res.config.url) {
      console.debug('[Response]', res.config.baseURL + res.config.url, res.status, res.data);
    }
    return res;
  },
  async (err: AxiosError) => {
    if (err && err.config) {
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
    } catch (error: any) {
      if (error.response?.status === 401) {
        store.dispatch(logout());
      }
    }
  } else {
    store.dispatch(logout());
  }
};
