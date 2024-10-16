import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { type RootState } from '..';
import { fetcher } from '../../utils/axios';

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
  countriesRatingHistory: Array<[number, Country[]]>;
}

const initialState: State = {
  countries: [],
  status: CountriesStatus.IDLE,
  countriesRatingHistory: []
};

// Thunk
export const fetchCountries = createAsyncThunk('countries/fetchCountries', async () => {
  const { data } = await fetcher.get('/api/countries/rating/');
  return data;
});

export const fetchCountryRatingHistory = createAsyncThunk<Country[], number>(
  'countries/fetchCountryRatingHistory',
  async (country_id: number) => {
    const { data } = await fetcher.get(`/api/countries/${country_id}/rating-history/`);
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
      .addCase(fetchCountries.fulfilled, (state, action) => {
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
        const history: Map<number, Country[]> = new Map(state.countriesRatingHistory);
        history.set(action.meta.arg, action.payload);
        state.countriesRatingHistory = Array.from(history);
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
