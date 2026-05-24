import { apiSlice } from '@/store/api/apiSlice';

import { type AuthTokens, loginSuccess } from '../slices/authSlice';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  birthDate: string;
  country: number;
  username: string;
  password: string;
  password2: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokens, LoginRequest>({
      query: (credentials) => ({
        url: '/api/accounts/token/',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_credentials, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        dispatch(loginSuccess());
      },
    }),

    register: builder.mutation<undefined, RegisterRequest>({
      query: (body) => ({
        url: '/api/accounts/register/',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
