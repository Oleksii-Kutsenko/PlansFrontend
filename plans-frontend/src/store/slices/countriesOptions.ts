import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';

export interface Option {
  name: string;
  value_name: string;
  year_name: string;
  normalized_name: string;
}

export interface State {
  options: Option[];
  loading: boolean;
}

const initialState: State = { options: [], loading: false };

export const fetchCountriesOptions = createAsyncThunk(
  'countries/fetchCountriesOptions',
  async () => {
    const response = await fetcher.options('/api/countries/rating/');
    const data = response.data;
    return data;
  }
);

const countriesOptionsSlice = createSlice({
  name: 'countriesOptions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCountriesOptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCountriesOptions.fulfilled, (state, action) => {
        state.options = action.payload;
        state.loading = false;
      })
      .addCase(fetchCountriesOptions.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const countriesOptionsReducer = countriesOptionsSlice.reducer;
