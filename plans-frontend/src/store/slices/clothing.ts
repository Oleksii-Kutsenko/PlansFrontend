import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';
import { LoadingStatus, ValidationErrors } from './utils';
import { AxiosError } from 'axios';

export interface Clothing {
  id: number;
  name: string;
  clothingType: string;
  season: string;
  image_path: string;
  outfit: number | null;
}

interface Outfit {

}

export interface ClothingCreate {
  name: string;
  clothing_type: string;
  season: string;
  image_path?: File | null;
}

interface State {
  clothing: Clothing[];
  outfit: Outfit[];
  status: LoadingStatus;
}

const initialState: State = {
  clothing: [],
  outfit: [],
  status: LoadingStatus.IDLE
};

export const fetchClothing = createAsyncThunk('clothing/fetchClothing', async () => {
  const { data } = await fetcher.get('/api/clothing/clothing');
  return data;
});

export const fetchOutfits = createAsyncThunk('clothing/fetchOutfit', async () => {
  const { data } = await fetcher.get('/api/clothing/outfit');
  return data;
});

export const createClothing = createAsyncThunk(
  'clothing/createClothing',
  async (clothing: ClothingCreate, { rejectWithValue }) => {
    try {
      const { data } = await fetcher.post('/api/clothing/clothing/', clothing);
      return data;
    } catch (err) {
      const error = err as AxiosError<ValidationErrors>;
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
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
        state.clothing = action.payload;
      })
      .addCase(createClothing.fulfilled, (state, action) => {
        state.clothing.push(action.payload);
      })
      .addCase(createClothing.rejected, (state, _action) => {
        state.status = LoadingStatus.FAILED;
      })
      .addCase(deleteClothing.fulfilled, (state, action) => {
        state.clothing = state.clothing.filter((item: Clothing) => item.id !== action.payload);
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
