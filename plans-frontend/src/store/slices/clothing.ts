import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';
import { LoadingStatus } from './utils';

export interface Clothing {
  id: number;
  name: string;
  clothingType: string;
  season: string;
  image_path: string;
  outfit: number | null;
}

export interface ClothingCreate {
  name: string;
  clothingType: string;
  season: string;
  image?: File | null;
  outfitId?: number | null;
}

interface State {
  clothings: Clothing[];
  status: LoadingStatus;
}

const initialState: State = {
  clothings: [],
  status: LoadingStatus.IDLE
};

export const fetchClothing = createAsyncThunk('clothing/fetchClothing', async () => {
  const { data } = await fetcher.get('/clothing');
  return data;
});

export const createClothing = createAsyncThunk(
  'clothing/createClothing',
  async (clothing: ClothingCreate) => {
    const { data } = await fetcher.post('/clothing/', clothing);
    return data;
  }
);

export const deleteClothing = createAsyncThunk('clothing/deleteClothing', async (id: number) => {
  await fetcher.delete(`/clothing/${id}`);
  return id;
});

const clothingSlice = createSlice({
  name: 'clothing',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClothing.fulfilled, (state, action) => {
        state.clothings = action.payload;
      })
      .addCase(createClothing.fulfilled, (state, action) => {
        state.clothings.push(action.payload);
      })
      .addCase(deleteClothing.fulfilled, (state, action) => {
        state.clothings = state.clothings.filter((item: Clothing) => item.id !== action.payload);
      });
  }
});

export const clothingActions = {
  ...clothingSlice.actions,
  fetchClothing,
  createClothing,
  deleteClothing
};
export const clothingReducer = clothingSlice.reducer;
