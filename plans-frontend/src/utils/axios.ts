import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import store from '../store';
import authSlice from '../store/slices/auth';

const axiosService = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
        failedRequest.response.config.headers.Authorization = 'Bearer ' + access;
        store.dispatch(authSlice.actions.setToken({ token: access, refreshToken: refresh }));
      })
      .catch((err) => {
        if (typeof err.response !== 'undefined' && err.response.status === 401) {
          store.dispatch(authSlice.actions.logout());
        }
      });
    return;
  } else {
    store.dispatch(authSlice.actions.logout());
  }
  return await Promise.reject(new Error('Refresh token is null'));
};

axiosService.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { token } = store.getState().auth;

  if (token != null && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.debug(
    '[Request]',
    new Date(),
    config.method,
    config.baseURL,
    config.url,
    JSON.stringify(token)
  );
  return config;
});

axiosService.interceptors.response.use(
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
    if (err?.config?.baseURL?.trim() !== '' && err?.config?.url?.trim() !== '') {
      console.debug(
        '[Response]',
        err.config.baseURL,
        err.config.url,
        err.response?.status,
        err.response?.data
      );
    }
    await refreshAuthLogic(err);
    return await Promise.reject(err);
  }
);

export async function fetcher<T = any>(url: string): Promise<T> {
  return await axiosService.get<T>(url).then((res) => res.data);
}

export default axiosService;
