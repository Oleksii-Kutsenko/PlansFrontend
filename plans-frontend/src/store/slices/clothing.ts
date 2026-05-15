import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';
import { LoadingStatus, ValidationErrors } from './utils';
import { AxiosError } from 'axios';

export interface Clothing {
  id: number;
  name: string;
  clothingType: string;
  color: string;
  imagePath: string;
  outfit: number | null;
}

export interface Occasion {
  id: number;
  occasionName: string;
}

export interface Outfit {
  id: number;
  outfitName: string;
  occasion: number;
  occasionName?: string;
  season: string;
  previewImage?: string | null;
  clothings: number[] | Clothing[];
  clothingCount?: number;
}

export interface ClothingCreate {
  name: string;
  clothingType: string;
  color: string;
  imagePath: File;
}

export interface OutfitCreate {
  outfitName: string;
  occasion: number;
  season: string;
  previewImage?: File | null;
  clothingIds: number[];
}

export interface OutfitUpdate {
  id: number;
  outfitName?: string;
  occasion: number;
  season?: string;
  previewImage?: File | null;
}

export interface ClothingOptions {
  clothingType?: { value: string; displayName: string }[];
  season?: { value: string; displayName: string }[];
}

export interface OutfitOptions {
  season?: { value: string; displayName: string }[];
}

interface State {
  clothing: Clothing[];
  outfit: Outfit[];
  currentOutfit: Outfit | null;
  options: ClothingOptions | null;
  outfitOptions: OutfitOptions | null;
  occasions: Occasion[];
  status: LoadingStatus;
}

const initialState: State = {
  clothing: [],
  outfit: [],
  currentOutfit: null,
  options: null,
  outfitOptions: null,
  occasions: [],
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
  if (data && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return Array.isArray(data) ? data : [];
});

export const fetchOutfits = createAsyncThunk('clothing/fetchOutfits', async () => {
  const { data } = await fetcher.get<PaginatedOutfitResponse | Outfit[]>('/api/clothing/outfit/');
  if (data && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return Array.isArray(data) ? data : [];
});
export interface OptionsResponse {
  actions?: {
    POST?: {
      clothingType?: { choices: { value: string; displayName: string }[] };
      season?: { choices: { value: string; displayName: string }[] };
    };
  };
}

export const fetchClothingOptions = createAsyncThunk('clothing/fetchClothingOptions', async () => {
  const response = await fetcher.options<OptionsResponse>('/api/clothing/clothing/');
  const actions = response.data?.actions?.POST;
  if (actions) {
    return {
      clothingType: actions.clothingType?.choices ?? [],
      season: actions.season?.choices ?? []
    };
  }
  return { clothingType: [], season: [] };
});

export const fetchOccasions = createAsyncThunk('clothing/fetchOccasions', async () => {
  const { data } = await fetcher.get<{ results?: Occasion[] } | Occasion[]>(
    '/api/clothing/occasion/'
  );
  if (data && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return Array.isArray(data) ? data : [];
});

export const createClothing = createAsyncThunk(
  'clothing/createClothing',
  async (clothing: ClothingCreate, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('name', clothing.name);
      formData.append('clothing_type', clothing.clothingType);

      if (clothing.color) {
        formData.append('color', clothing.color);
      }

      if (clothing.imagePath) {
        formData.append('image_path', clothing.imagePath);
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

export const createOutfit = createAsyncThunk(
  'clothing/createOutfit',
  async (outfit: OutfitCreate, { rejectWithValue }) => {
    try {
      let payload: FormData | OutfitCreate;
      const headers: Record<string, string> = {};

      if (outfit.previewImage) {
        const formData = new FormData();
        formData.append('outfit_name', outfit.outfitName);
        formData.append('occasion', String(outfit.occasion));
        formData.append('season', outfit.season);
        formData.append('preview_image', outfit.previewImage);
        outfit.clothingIds.forEach((id) => formData.append('clothing_ids', String(id)));
        payload = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        payload = outfit;
      }

      const { data } = await fetcher.post<Outfit>('/api/clothing/outfit/', payload, { headers });
      return data;
    } catch (err) {
      const error = err as AxiosError<ValidationErrors>;
      if (!error.response) throw error;
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

export const fetchOutfit = createAsyncThunk(
  'clothing/fetchOutfit',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await fetcher.get<Outfit>(`/api/clothing/outfit/${id}/`);
      return data;
    } catch (err) {
      const error = err as AxiosError;
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateOutfit = createAsyncThunk(
  'clothing/updateOutfit',
  async (outfit: OutfitUpdate, { rejectWithValue }) => {
    try {
      const { id, ...payload } = outfit;
      const { data } = await fetcher.patch<Outfit>(`/api/clothing/outfit/${id}/`, payload);
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

export const fetchOutfitOptions = createAsyncThunk('clothing/fetchOutfitOptions', async () => {
  const response = await fetcher.options<OptionsResponse>('/api/clothing/outfit/');
  const actions = response.data?.actions?.POST;
  if (actions) {
    return {
      season: actions.season?.choices ?? []
    };
  }
  return { season: [] };
});

export const addItemToOutfit = createAsyncThunk(
  'clothing/addItemToOutfit',
  async (
    { outfitId, clothingId }: { outfitId: number; clothingId: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await fetcher.post<Outfit>(`/api/clothing/outfit/${outfitId}/clothings/`, {
        clothingId
      });
      return data;
    } catch (err) {
      const error = err as AxiosError;
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeItemFromOutfit = createAsyncThunk(
  'clothing/removeItemFromOutfit',
  async (
    { outfitId, clothingId }: { outfitId: number; clothingId: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await fetcher.delete<Outfit>(
        `/api/clothing/outfit/${outfitId}/clothings/${clothingId}/`
      );
      return data;
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
      .addCase(fetchOccasions.fulfilled, (state, action) => {
        state.occasions = action.payload;
      })
      .addCase(createClothing.fulfilled, (state, action: { payload: Clothing }) => {
        state.clothing.push(action.payload);
      })
      .addCase(createClothing.rejected, (state) => {
        state.status = LoadingStatus.FAILED;
      })
      .addCase(createOutfit.fulfilled, (state, action: { payload: Outfit }) => {
        state.outfit.push(action.payload);
        state.outfit = [...state.outfit];
      })
      .addCase(createOutfit.rejected, (state) => {
        state.status = LoadingStatus.FAILED;
      })
      .addCase(deleteClothing.fulfilled, (state, action) => {
        state.clothing = state.clothing.filter((item: Clothing) => item.id !== action.payload);
      })
      .addCase(deleteOutfit.fulfilled, (state, action) => {
        state.outfit = state.outfit.filter((item: Outfit) => item.id !== action.payload);
      })
      .addCase(fetchOutfit.fulfilled, (state, action: { payload: Outfit }) => {
        state.currentOutfit = action.payload;
      })
      .addCase(fetchOutfit.rejected, (state) => {
        state.currentOutfit = null;
      })
      .addCase(updateOutfit.fulfilled, (state, action: { payload: Outfit }) => {
        state.currentOutfit = action.payload;
        const index = state.outfit.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.outfit[index] = action.payload;
        }
      })
      .addCase(updateOutfit.rejected, (state) => {
        state.status = LoadingStatus.FAILED;
      })
      .addCase(fetchOutfitOptions.fulfilled, (state, action) => {
        state.outfitOptions = action.payload;
      })
      .addCase(addItemToOutfit.fulfilled, (state, action: { payload: Outfit }) => {
        state.currentOutfit = action.payload;
      })
      .addCase(removeItemFromOutfit.fulfilled, (state, action: { payload: Outfit }) => {
        state.currentOutfit = action.payload;
      });
  }
});

export const clothingActions = {
  ...clothingSlice.actions,
  fetchClothing,
  fetchOutfits,
  fetchClothingOptions,
  fetchOccasions,
  fetchOutfitOptions,
  createClothing,
  createOutfit,
  deleteClothing,
  deleteOutfit,
  fetchOutfit,
  updateOutfit,
  addItemToOutfit,
  removeItemFromOutfit
};
export const clothingReducer = clothingSlice.reducer;
