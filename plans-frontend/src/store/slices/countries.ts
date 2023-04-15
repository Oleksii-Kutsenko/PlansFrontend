import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import fetcher from '../../utils/axios';
import { type RootState } from '..';

interface Country {
  name: number;
  [key: string]: number;
  rating: number;
}

interface State {
  countries: Country[];
  loading: boolean;
}

const countriesInitialState: State = { countries: [], loading: false };

export const fetchCountries = createAsyncThunk('countries/fetchCountries', async () => {
  const response = await fetcher.get('/api/countries/rating/');
  const data = response.data;
  return data;
});

const countriesSlice = createSlice({
  name: 'countries',
  initialState: countriesInitialState,
  reducers: {},
  extraReducers(builder) {
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

export default countriesSlice;

export const getCountries = (state: RootState): Country[] => state.countries.countries;
