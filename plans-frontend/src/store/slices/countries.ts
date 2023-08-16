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
  name: string;
  rating: number;
}

interface State {
  countries: Country[];
  status: CountriesStatus;
}

const initialState: State = {
  countries: [],
  status: CountriesStatus.IDLE
};

// Thunk
export const fetchCountries = createAsyncThunk('countries/fetchCountries', async () => {
  const { data } = await fetcher.get('/api/countries/rating/');
  return data;
});

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
      });
  }
});

// Selectors
export const getCountries = (state: RootState): Country[] => state.countries.countries;

// Exports
export const countriesActions = { ...countriesSlice.actions };
export const countriesReducer = countriesSlice.reducer;
