import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

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
  const auth = authHeader();
  if (auth) {
    config.headers.Authorization = auth;
  }
  console.debug(
    '[Request]',
    config.method,
    config.baseURL,
    config.url,
    JSON.stringify(config.headers.Authorization),
  );
  return config;
});

function authHeader(): string | undefined {
  const token = localStorage.getItem('access');
  if (token) {
    return `Bearer ${token}`;
  }
  return undefined;
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

  if (err.response?.status !== 401 || originalConfig._retry) {
    throw err;
  }

  originalConfig._retry = true;

  // 2. QUEUE BRANCH: If a refresh is already happening, pause and wait in the queue
  if (isRefreshing) {
    try {
      const token = await new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });

      if (typeof token === 'string') {
        originalConfig.headers.Authorization = `Bearer ${token}`;
      }
      return await fetcher(originalConfig);
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // 3. REFRESH BRANCH: We are the first 401, so we handle the actual refresh
  isRefreshing = true;

  try {
    const refreshToken = localStorage.getItem('refresh');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const resp = await axios.post(`${import.meta.env.VITE_API_URL}/api/accounts/refresh/`, {
      refresh: refreshToken,
    });

    const { access, refresh } = resp.data as { access: string; refresh: string };
    console.log('Refreshed token:', access, refresh);

    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    originalConfig.headers.Authorization = `Bearer ${access}`;

    processQueue(null, access);
    return await fetcher(originalConfig);
  } catch (error) {
    const parsedError = error instanceof Error ? error : new Error(String(error));
    processQueue(parsedError, null);
    throw parsedError;
  } finally {
    isRefreshing = false;
  }
};

fetcher.interceptors.response.use((res: AxiosResponse<InternalAxiosRequestConfig, AxiosError>) => {
  if (res.config.baseURL && res.config.url) {
    console.debug('[Response]', res.config.baseURL + res.config.url, res.status, res.data);
  }
  return res;
}, handleResponseError);
