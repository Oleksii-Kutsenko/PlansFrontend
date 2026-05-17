import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetcher } from '../../utils/axios';
import { type RootState } from '..';

export enum CountriesStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

export interface Country {
  id: number;
  name: string;
  rating: number;
  year: number;
  [key: string]: number | string;
}

interface State {
  countries: Country[];
  status: CountriesStatus;
  countriesRatingHistory: [number, Country[]][];
}

const initialState: State = {
  countries: [],
  status: CountriesStatus.IDLE,
  countriesRatingHistory: []
};

// Thunk
export const fetchCountries = createAsyncThunk('countries/fetchCountries', async () => {
  const { data } = await fetcher.get<Country[]>('/api/countries/rating/');
  return data;
});

export const fetchCountryRatingHistory = createAsyncThunk<Country[], number>(
  'countries/fetchCountryRatingHistory',
  async (countryId: number) => {
    const { data } = await fetcher.get<Country[]>(`/api/countries/${countryId}/rating-history/`);
    return data;
  }
);

// Slice
const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.fulfilled, (state, action: PayloadAction<Country[]>) => {
        state.countries = action.payload;
        state.status = CountriesStatus.SUCCEEDED;
      })
      .addCase(fetchCountries.pending, (state) => {
        state.status = CountriesStatus.LOADING;
      })
      .addCase(fetchCountries.rejected, (state) => {
        state.status = CountriesStatus.FAILED;
      })
      .addCase(fetchCountryRatingHistory.fulfilled, (state, action) => {
        const history = new Map<number, Country[]>(state.countriesRatingHistory);
        history.set(action.meta.arg, action.payload);
        state.countriesRatingHistory = [...history];
      })
      .addCase(fetchCountryRatingHistory.rejected, () => {
        console.debug('Failed to load country rating history');
      });
  }
});

// Selectors
export const getCountries = (state: RootState): Country[] => state.countries.countries;

// Exports
export const countriesActions = {
  ...countriesSlice.actions,
  fetchCountries,
  fetchCountryRatingHistory
};
export const countriesReducer = countriesSlice.reducer;
