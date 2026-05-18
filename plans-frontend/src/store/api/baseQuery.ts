import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
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
      modifiedArgs.params = keysToSnake(args.params) as Record<string, any>;
    }
  }

  let result = await rawBaseQuery(modifiedArgs, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (isRefreshing) {
      try {
        const token = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        if (token) {
           result = await rawBaseQuery(modifiedArgs, api, extraOptions);
        }
      } catch (err) {
        return { error: { status: 'FETCH_ERROR', error: String(err) } };
      }
    } else {
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh');

      if (refreshToken) {
        const refreshResult = await rawBaseQuery(
          {
            url: '/api/accounts/refresh/',
            method: 'POST',
            body: { refresh: refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const { access, refresh } = refreshResult.data as { access: string; refresh: string };
          localStorage.setItem('access', access);
          localStorage.setItem('refresh', refresh);
          
          processQueue(null, access);
          result = await rawBaseQuery(modifiedArgs, api, extraOptions);
        } else {
          processQueue(new Error('Refresh failed'));
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
        }
      } else {
         processQueue(new Error('No refresh token'));
      }
      isRefreshing = false;
    }
  }

  if (result.data && typeof result.data === 'object') {
    result.data = keysToCamel(result.data);
  }

  return result;
};
