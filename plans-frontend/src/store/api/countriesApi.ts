import { apiSlice } from './apiSlice';

export interface Country {
  id: number;
  name: string;
  rating: number;
  year: number;
  [key: string]: number | string;
}

export interface CountryOption {
  name: string;
  valueName: string;
  yearName: string;
  normalizedName: string;
}

export const countriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchCountries: builder.query<Country[], undefined>({
      query: () => '/api/countries/rating/',
      providesTags: ['Countries'],
    }),

    fetchCountryRatingHistory: builder.query<Country[], number>({
      query: (countryId) => `/api/countries/${String(countryId)}/rating-history/`,
      providesTags: (_result, _error, countryId) => [{ type: 'Countries', id: countryId }],
    }),

    fetchCountriesOptions: builder.query<CountryOption[], undefined>({
      query: () => ({
        url: '/api/countries/rating/',
        method: 'OPTIONS',
      }),
      providesTags: ['Countries'],
    }),
  }),
});

export const {
  useFetchCountriesQuery,
  useFetchCountryRatingHistoryQuery,
  useFetchCountriesOptionsQuery,
} = countriesApi;
