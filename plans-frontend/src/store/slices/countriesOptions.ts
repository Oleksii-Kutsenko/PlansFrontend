import type { RootState } from '..';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fetcher from '../../utils/axios';
// interface options {
//   name: string;
//   value_name: string;
//   year_name: string;
//   normalized_name: string;
// };
const countriesOptionsInitialState: { options: number[] } = { options: [] };
export const fetchCountriesOptions = createAsyncThunk(
  'countries/fetchCountriesOptions',
  async (_, { getState }) => {
    const currentState = getState() as RootState;
    if (currentState.auth.token === null) {
      throw new Error('Token is null');
    } else {
      const response = await fetcher.options('http://127.0.0.1:8000/api/countries/rating/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentState.auth.token}`
        }
      });
      const data = response.data;
      return data;
    }
  }
);
const countriesOptionsSlice = createSlice({
  name: 'countriesOptions',
  initialState: countriesOptionsInitialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchCountriesOptions.fulfilled, (state, action) => {
      state.options = action.payload;
    });
  }
});

export default countriesOptionsSlice;

export const getCountriesOptions: any = (state: any) => state.countriesOptions.options;
