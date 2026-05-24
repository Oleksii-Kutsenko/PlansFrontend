import {
  type BaseQueryFn,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { logout } from '../../features/auth/slices/authSlice';
import { keysToCamel, keysToSnake } from '../../utils/caseUtils';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('access');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

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

const handleUnauthorized = async (
  modifiedArgs: string | FetchArgs,
  api: Parameters<typeof rawBaseQuery>[1],
  extraOptions: Parameters<typeof rawBaseQuery>[2],
): Promise<Awaited<ReturnType<typeof rawBaseQuery>>> => {
  if (isRefreshing) {
    try {
      const token = await new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      if (token) {
        return await rawBaseQuery(modifiedArgs, api, extraOptions);
      }
    } catch (error) {
      return { error: { status: 'FETCH_ERROR', error: String(error) } };
    }
  }

  isRefreshing = true;
  const refreshToken = localStorage.getItem('refresh');

  if (!refreshToken) {
    processQueue(new Error('No refresh token'));
    api.dispatch(logout());
    isRefreshing = false;
    return { error: { status: 401, data: 'No refresh token' } };
  }

  const refreshResult = await rawBaseQuery(
    { url: '/api/accounts/refresh/', method: 'POST', body: { refresh: refreshToken } },
    api,
    extraOptions,
  );

  if (!refreshResult.data) {
    processQueue(new Error('Refresh failed'));
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    api.dispatch(logout());
    isRefreshing = false;
    return { error: { status: 401, data: 'Refresh failed' } };
  }

  const { access, refresh } = refreshResult.data as { access: string; refresh: string };
  localStorage.setItem('access', access);
  localStorage.setItem('refresh', refresh);
  processQueue(null, access);
  isRefreshing = false;
  return await rawBaseQuery(modifiedArgs, api, extraOptions);
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let modifiedArgs = args;

  if (typeof args !== 'string') {
    modifiedArgs = { ...args };

    if (args.body && !(args.body instanceof FormData)) {
      modifiedArgs.body = keysToSnake(args.body);
    }

    if (args.params) {
      modifiedArgs.params = keysToSnake(args.params) as Record<string, string | number>;
    }
  }

  let result = await rawBaseQuery(modifiedArgs, api, extraOptions);

  if (result.error?.status === 401) {
    result = await handleUnauthorized(modifiedArgs, api, extraOptions);
  }

  if (result.data && typeof result.data === 'object') {
    result.data = keysToCamel(result.data);
  }

  return result;
};
