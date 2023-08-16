import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';

export enum CountriesOptionsStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

export interface Option {
  name: string;
  value_name: string;
  year_name: string;
  normalized_name: string;
}

export interface State {
  options: Option[];
  status: CountriesOptionsStatus;
}

const initialState: State = { options: [], status: CountriesOptionsStatus.IDLE };

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
        state.status = CountriesOptionsStatus.LOADING;
      })
      .addCase(fetchCountriesOptions.fulfilled, (state, action) => {
        state.options = action.payload;
        state.status = CountriesOptionsStatus.SUCCEEDED;
      })
      .addCase(fetchCountriesOptions.rejected, (state) => {
        state.status = CountriesOptionsStatus.FAILED;
      });
  }
});

export const countriesOptionsReducer = countriesOptionsSlice.reducer;
