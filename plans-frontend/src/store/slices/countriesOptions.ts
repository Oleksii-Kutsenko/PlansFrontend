import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import fetcher from '../../utils/axios';

interface Option {
  name: string;
  value_name: string;
  year_name: string;
  normalized_name: string;
}

interface State {
  options: Option[];
  loading: boolean;
}

const countriesOptionsInitialState: State = { options: [], loading: false };

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
  initialState: countriesOptionsInitialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCountriesOptions.fulfilled, (state, action) => {
        state.options = action.payload;
        state.loading = false;
      })
      .addCase(fetchCountriesOptions.pending, (state, _) => {
        state.loading = true;
      })
      .addCase(fetchCountriesOptions.rejected, (state, _) => {
        state.loading = false;
      });
  }
});

export default countriesOptionsSlice;
