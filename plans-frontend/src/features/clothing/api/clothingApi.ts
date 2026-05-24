import { apiSlice } from '@/store/api/apiSlice';

// Interfaces
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
  clothings: Clothing[];
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

interface ClothingTypeChoice {
  value: string;
  displayName: string;
}

export interface ClothingOptions {
  clothingType: ClothingTypeChoice[];
}

export interface OutfitOptions {
  season: ClothingTypeChoice[];
}

// Helpers to build FormData for multipart requests
const buildClothingFormData = (clothing: ClothingCreate): FormData => {
  const formData = new FormData();
  formData.append('name', clothing.name);
  formData.append('clothing_type', clothing.clothingType);
  if (clothing.color) {
    formData.append('color', clothing.color);
  }
  formData.append('image_path', clothing.imagePath);
  return formData;
};

const buildOutfitFormData = (outfit: OutfitCreate): FormData => {
  const formData = new FormData();
  formData.append('outfit_name', outfit.outfitName);
  formData.append('occasion', String(outfit.occasion));
  formData.append('season', outfit.season);
  if (outfit.previewImage) {
    formData.append('preview_image', outfit.previewImage);
  }
  for (const id of outfit.clothingIds) {
    formData.append('clothing_ids', String(id));
  }
  return formData;
};

export const clothingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Queries ---

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchClothing: builder.query<Clothing[], void>({
      query: () => '/api/clothing/clothing/',
      providesTags: ['Clothing'],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchOutfits: builder.query<Outfit[], void>({
      query: () => '/api/clothing/outfit/',
      providesTags: ['Outfits'],
    }),

    fetchOutfit: builder.query<Outfit, number>({
      query: (id) => `/api/clothing/outfit/${String(id)}/`,
      providesTags: (_result, _error, id) => [{ type: 'Outfits', id }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchOccasions: builder.query<Occasion[], void>({
      query: () => '/api/clothing/occasion/',
      providesTags: ['Clothing'],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchClothingOptions: builder.query<ClothingOptions, void>({
      query: () => ({ url: '/api/clothing/clothing/', method: 'OPTIONS' }),
      transformResponse: (response: {
        actions: {
          POST: {
            clothingType: { choices: ClothingTypeChoice[] };
          };
        };
      }) => ({
        clothingType: response.actions.POST.clothingType.choices,
      }),
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchOutfitOptions: builder.query<OutfitOptions, void>({
      query: () => ({ url: '/api/clothing/outfit/', method: 'OPTIONS' }),
      transformResponse: (response: {
        actions: { POST: { season: { choices: ClothingTypeChoice[] } } };
      }) => ({
        season: response.actions.POST.season.choices,
      }),
    }),

    // --- Mutations ---

    createClothing: builder.mutation<Clothing, ClothingCreate>({
      query: (clothing) => ({
        url: '/api/clothing/clothing/',
        method: 'POST',
        body: buildClothingFormData(clothing),
      }),
      invalidatesTags: ['Clothing'],
    }),

    createOutfit: builder.mutation<Outfit, OutfitCreate>({
      query: (outfit) => ({
        url: '/api/clothing/outfit/',
        method: 'POST',
        body: buildOutfitFormData(outfit),
      }),
      invalidatesTags: ['Outfits'],
    }),

    deleteClothing: builder.mutation<undefined, number>({
      query: (id) => ({
        url: `/api/clothing/clothing/${String(id)}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clothing'],
    }),

    deleteOutfit: builder.mutation<undefined, number>({
      query: (id) => ({
        url: `/api/clothing/outfit/${String(id)}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Outfits'],
    }),

    updateOutfit: builder.mutation<Outfit, OutfitUpdate>({
      query: ({ id, ...payload }) => ({
        url: `/api/clothing/outfit/${String(id)}/`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Outfits', id }],
    }),

    addItemToOutfit: builder.mutation<Outfit, { outfitId: number; clothingId: number }>({
      query: ({ outfitId, clothingId }) => ({
        url: `/api/clothing/outfit/${String(outfitId)}/clothings/`,
        method: 'POST',
        body: { clothingId },
      }),
      invalidatesTags: (_result, _error, { outfitId }) => [{ type: 'Outfits', id: outfitId }],
    }),

    removeItemFromOutfit: builder.mutation<Outfit, { outfitId: number; clothingId: number }>({
      query: ({ outfitId, clothingId }) => ({
        url: `/api/clothing/outfit/${String(outfitId)}/clothings/${String(clothingId)}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { outfitId }) => [{ type: 'Outfits', id: outfitId }],
    }),
  }),
});

export const {
  useFetchClothingQuery,
  useFetchOutfitsQuery,
  useFetchOutfitQuery,
  useFetchOccasionsQuery,
  useFetchClothingOptionsQuery,
  useFetchOutfitOptionsQuery,
  useCreateClothingMutation,
  useCreateOutfitMutation,
  useDeleteClothingMutation,
  useDeleteOutfitMutation,
  useUpdateOutfitMutation,
  useAddItemToOutfitMutation,
  useRemoveItemFromOutfitMutation,
} = clothingApi;
