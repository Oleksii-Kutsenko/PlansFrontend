import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';
import { LoadingStatus, ValidationErrors } from './utils';
import { AxiosError } from 'axios';

export interface Clothing {
  id: number;
  name: string;
  clothing_type: string;
  season: string;
  image_path: string;
  outfit: number | null;
}

export interface Occasion {
  id: number;
  occasion_name: string;
}

export interface Outfit {
  id: number;
  outfit_name: string;
  occasion: number;
  clothings: number[];
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
  const { data } = await fetcher.get('/api/clothing/clothing/');
  return data;
});

export const fetchOutfits = createAsyncThunk('clothing/fetchOutfit', async () => {
  const { data } = await fetcher.get('/api/clothing/outfit/');
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
  await fetcher.delete(`/api/clothing/clothing/${id}/`);
  return id;
});

export const deleteOutfit = createAsyncThunk('clothing/deleteOutfit', async (id: number) => {
  await fetcher.delete(`/api/clothing/outfit/${id}/`);
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
      .addCase(fetchOutfits.fulfilled, (state, action) => {
        state.outfit = action.payload;
      })
      .addCase(createClothing.fulfilled, (state, action) => {
        state.clothing.push(action.payload);
      })
      .addCase(createClothing.rejected, (state, _action) => {
        state.status = LoadingStatus.FAILED;
      })
      .addCase(deleteClothing.fulfilled, (state, action) => {
        state.clothing = state.clothing.filter((item: Clothing) => item.id !== action.payload);
      })
      .addCase(deleteOutfit.fulfilled, (state, action) => {
        state.outfit = state.outfit.filter((item: Outfit) => item.id !== action.payload);
      });
  }
});

export const clothingActions = {
  ...clothingSlice.actions,
  fetchClothing,
  fetchOutfits,
  createClothing,
  deleteClothing,
  deleteOutfit
};
export const clothingReducer = clothingSlice.reducer;
