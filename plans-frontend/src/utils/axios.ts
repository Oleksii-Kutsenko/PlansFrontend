import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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
    if (res.config.baseURL !== undefined && res.config.url !== undefined) {
      console.debug('[Response]', res.config.baseURL + res.config.url, res.status, res.data);
    }
    return await Promise.resolve(res);
  },
  async (err: {
    config: { baseURL: string; url: string };
    response?: { status: number; data: object };
  }) => {
    console.debug(
      '[Response]',
      err.config.baseURL,
      err.config.url,
      err.response?.status,
      err.response?.data
    );
    await refreshAuthLogic(err);
    return await Promise.reject(err);
  }
);

const refreshAuthLogic = async (failedRequest: any): Promise<any> => {
  const { refreshToken } = store.getState().auth;
  if (refreshToken != null) {
    await axios
      .post(
        '/api/accounts/refresh/',
        {
          refresh: refreshToken
        },
        {
          baseURL: process.env.REACT_APP_API_URL
        }
      )
      .then((resp) => {
        const { access, refresh } = resp.data as { access: string; refresh: string };
        console.log('Refreshed token: ', access, refresh);
        failedRequest.response.config.headers.Authorization = 'Bearer ' + access;
        store.dispatch(setToken({ access, refresh }));
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          store.dispatch(logout());
        }
      });
    return;
  } else {
    store.dispatch(logout());
  }
  return await Promise.reject(new Error('Refresh token is null'));
};
