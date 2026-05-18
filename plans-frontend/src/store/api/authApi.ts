import { apiSlice } from './apiSlice';
import { AuthTokens } from '../slices/auth';

interface LoginFormInputs {
  username?: string;
  password?: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokens, LoginFormInputs>({
      query: (credentials) => ({
        url: '/api/accounts/token/',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
