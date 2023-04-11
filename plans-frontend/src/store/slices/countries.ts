import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import fetcher from '../../utils/axios';

const countriesInitialState: object[] = [];
export const fetchCountries = createAsyncThunk('countries/fetchCountries', async () => {
  const response = await fetcher.get('http://127.0.0.1:8000/api/countries/rating/');
  const data = response.data;
  return data;
});
const countriesSlice = createSlice({
  name: 'countries',
  initialState: countriesInitialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchCountries.fulfilled, (_, action: { payload: object[] }) => {
      return action.payload;
    });
  }
});

export default countriesSlice;
