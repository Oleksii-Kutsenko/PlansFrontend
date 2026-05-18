import { apiSlice } from './apiSlice';

export interface User {
  birthDate: string;
  country: string;
  isAdmin: boolean;
  username: string;
  wealthManagementID: number;
}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchCurrentUser: builder.query<User, void>({
      query: () => '/api/accounts/user/',
      providesTags: ['User'],
    }),
  }),
});

export const { useFetchCurrentUserQuery } = userApi;
