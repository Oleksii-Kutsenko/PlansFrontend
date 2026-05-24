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

export interface CountryListItem {
  id: number;
  name: string;
}

export const countriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchCountries: builder.query<Country[], void>({
      query: () => '/api/countries/rating/',
      providesTags: ['Countries'],
    }),

    fetchCountryRatingHistory: builder.query<Country[], number>({
      query: (countryId) => `/api/countries/${String(countryId)}/rating-history/`,
      providesTags: (_result, _error, countryId) => [{ type: 'Countries', id: countryId }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchCountriesOptions: builder.query<CountryOption[], void>({
      query: () => ({
        url: '/api/countries/rating/',
        method: 'OPTIONS',
      }),
      providesTags: ['Countries'],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchCountryList: builder.query<CountryListItem[], void>({
      query: () => '/api/countries/',
      providesTags: ['Countries'],
    }),
  }),
});

export const {
  useFetchCountriesQuery,
  useFetchCountryRatingHistoryQuery,
  useFetchCountriesOptionsQuery,
  useFetchCountryListQuery,
} = countriesApi;
