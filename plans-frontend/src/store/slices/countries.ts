import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { type RootState } from '..';
import { fetcher } from '../../utils/axios';

export interface Country {
  name: string;
  rating: number;
}

interface State {
  countries: Country[];
  loading: boolean;
}

const initialState: State = {
  countries: [],
  loading: false
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
        state.loading = false;
      })
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCountries.rejected, (state) => {
        state.loading = false;
      });
  }
});

// Selectors
export const getCountries = (state: RootState): Country[] => state.countries.countries;

// Exports
export const countriesActions = { ...countriesSlice.actions };
export const countriesReducer = countriesSlice.reducer;
