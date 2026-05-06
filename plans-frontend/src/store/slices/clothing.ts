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
  clothings: number[] | Clothing[];
}

export interface ClothingCreate {
  name: string;
  clothing_type: string;
  season: string;
  image_path?: File | null | undefined;
}

interface State {
  clothing: Clothing[];
  outfit: Outfit[];
  options: any;
  status: LoadingStatus;
}

const initialState: State = {
  clothing: [],
  outfit: [],
  options: null,
  status: LoadingStatus.IDLE
};

export interface PaginatedClothingResponse {
  results?: Clothing[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface PaginatedOutfitResponse {
  results?: Outfit[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export const fetchClothing = createAsyncThunk('clothing/fetchClothing', async () => {
  const { data } = await fetcher.get<PaginatedClothingResponse | Clothing[]>(
    '/api/clothing/clothing/'
  );
  return 'results' in data && data.results ? data.results : (data as Clothing[]);
});

export const fetchOutfits = createAsyncThunk('clothing/fetchOutfit', async () => {
  const { data } = await fetcher.get<PaginatedOutfitResponse | Outfit[]>('/api/clothing/outfit/');
  return 'results' in data && data.results ? data.results : (data as Outfit[]);
});
export interface OptionsResponse {
  actions?: {
    POST?: {
      clothing_type?: { choices: { value: string; display_name: string }[] };
      season?: { choices: { value: string; display_name: string }[] };
    };
  };
}

export const fetchClothingOptions = createAsyncThunk('clothing/fetchClothingOptions', async () => {
  const response = await fetcher.options<OptionsResponse>('/api/clothing/outfit/');
  const actions = response.data?.actions?.POST;
  if (actions) {
    return {
      clothing_type: actions.clothing_type?.choices ?? [],
      season: actions.season?.choices ?? []
    };
  }
  return { clothing_type: [], season: [] };
});

export const createClothing = createAsyncThunk(
  'clothing/createClothing',
  async (clothing: ClothingCreate, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('name', clothing.name);
      formData.append('clothing_type', clothing.clothing_type);
      formData.append('season', clothing.season);
      if (clothing.image_path) {
        formData.append('image_path', clothing.image_path);
      }
      const { data } = await fetcher.post<Clothing>('/api/clothing/clothing/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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

export const deleteClothing = createAsyncThunk(
  'clothing/deleteClothing',
  async (id: number, { rejectWithValue }) => {
    try {
      await fetcher.delete(`/api/clothing/clothing/${id}/`);
      return id;
    } catch (err) {
      const error = err as AxiosError;
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteOutfit = createAsyncThunk(
  'clothing/deleteOutfit',
  async (id: number, { rejectWithValue }) => {
    try {
      await fetcher.delete(`/api/clothing/outfit/${id}/`);
      return id;
    } catch (err) {
      const error = err as AxiosError;
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const clothingSlice = createSlice({
  name: 'clothing',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClothing.fulfilled, (state, action: { payload: Clothing[] }) => {
        state.clothing = action.payload;
      })
      .addCase(fetchOutfits.fulfilled, (state, action: { payload: Outfit[] }) => {
        state.outfit = action.payload;
      })
      .addCase(fetchClothingOptions.fulfilled, (state, action) => {
        state.options = action.payload;
      })
      .addCase(createClothing.fulfilled, (state, action: { payload: Clothing }) => {
        state.clothing.push(action.payload);
      })
      .addCase(createClothing.rejected, (state) => {
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
  fetchClothingOptions,
  createClothing,
  deleteClothing,
  deleteOutfit
};
export const clothingReducer = clothingSlice.reducer;
