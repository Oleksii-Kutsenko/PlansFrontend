import { AuthTokens } from '../slices/auth';
import { apiSlice } from './apiSlice';

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
