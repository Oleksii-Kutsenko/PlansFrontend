import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';
import { LoadingStatus } from './utils';

export interface Option {
  name: string;
  value_name: string;
  year_name: string;
  normalized_name: string;
}

export interface State {
  options: Option[];
  status: LoadingStatus;
}

const initialState: State = { options: [], status: LoadingStatus.IDLE };

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
        state.status = LoadingStatus.LOADING;
      })
      .addCase(fetchCountriesOptions.fulfilled, (state, action) => {
        state.options = action.payload;
        state.status = LoadingStatus.SUCCEEDED;
      })
      .addCase(fetchCountriesOptions.rejected, (state) => {
        state.status = LoadingStatus.FAILED;
      });
  }
});

export const countriesOptionsReducer = countriesOptionsSlice.reducer;
