import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { type RootState } from '..';
import { fetcher } from '../../utils/axios';
import { LoadingStatus } from './utils';

export interface Country {
  id: number;
  name: string;
  rating: number;
  year: number;
  [key: string]: number | string;
}

interface State {
  countries: Country[];
  status: LoadingStatus;
  countriesRatingHistory: Array<[number, Country[]]>;
}

const initialState: State = {
  countries: [],
  status: LoadingStatus.IDLE,
  countriesRatingHistory: []
};

// Thunk
export const fetchCountries = createAsyncThunk('countries/fetchCountries', async () => {
  const { data } = await fetcher.get('/api/countries/rating/');
  return data;
});

export const fetchCountryRatingHistory = createAsyncThunk<Country[], number>(
  'countries/fetchCountryRatingHistory',
  async (countryId: number) => {
    const { data } = await fetcher.get(`/api/countries/${countryId}/rating-history/`);
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
        state.status = LoadingStatus.SUCCEEDED;
      })
      .addCase(fetchCountries.pending, (state) => {
        state.status = LoadingStatus.LOADING;
      })
      .addCase(fetchCountries.rejected, (state) => {
        state.status = LoadingStatus.FAILED;
      })
      .addCase(fetchCountryRatingHistory.fulfilled, (state, action) => {
        const history: Map<number, Country[]> = new Map(state.countriesRatingHistory);
        history.set(action.meta.arg, action.payload);
        state.countriesRatingHistory = Array.from(history);
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
