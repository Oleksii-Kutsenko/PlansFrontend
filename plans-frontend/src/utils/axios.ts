import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import store from '../store';
import authSlice from '../store/slices/auth';

const axiosService = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosService.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { token } = store.getState().auth;

  if (
    token != null &&
    token.trim() !== '' &&
    typeof config.baseURL !== 'undefined' &&
    config.baseURL?.trim() !== '' &&
    typeof config.url !== 'undefined' &&
    config.url.trim() !== ''
  ) {
    config.headers.Authorization = `Bearer ${token}`;
    console.debug('[Request]', `${config.baseURL}${config.url}`, JSON.stringify(token));
  }
  return config;
});

axiosService.interceptors.response.use(
  async (res: AxiosResponse<any, any>) => {
    if (res.config.baseURL !== undefined && res.config.url !== undefined) {
      console.debug('[Response]', res.config.baseURL + res.config.url, res.status, res.data);
    }
    return await Promise.resolve(res);
  },
  async (err: {
    config: { baseURL: string; url: string };
    response: { status: number; data: object };
  }) => {
    if (err.config.baseURL.trim() !== '' && err.config.url.trim() !== '') {
      console.debug(
        '[Response]',
        err.config.baseURL,
        err.config.url,
        err.response.status,
        err.response.data
      );
    }
    return await Promise.reject(err);
  }
);

const refreshAuthLogic = async (failedRequest: any): Promise<any> => {
  const { refreshToken } = store.getState().auth;
  if (refreshToken !== null) {
    await axios
      .post(
        '/auth/refresh/',
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
  }
  return await Promise.reject(new Error('Refresh token is null'));
};

createAuthRefreshInterceptor(axiosService, refreshAuthLogic);

export async function fetcher<T = any>(url: string): Promise<T> {
  return await axiosService.get<T>(url).then((res) => res.data);
}

export default axiosService;
