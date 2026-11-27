import { createSelector } from '@reduxjs/toolkit';

import type {
  CreateIngredientPayload,
  CreateNutrientPayload,
  CreatePlanMealPayload,
  CreatePlanPayload,
  CreateRecipePayload,
  CreateTargetPayload,
  FetchIngredientsParams,
  FetchPlansParams,
  Ingredient,
  Nutrient,
  PaginatedResponse,
  Plan,
  PlanMeal,
  PlanSummary,
  Recipe,
  UpdateIngredientPayload,
  UpdateNutrientPayload,
  UpdatePlanMealPayload,
  UpdatePlanPayload,
  UpdateRecipePayload,
  UpdateTargetPayload,
  UserNutrientTarget,
} from '@/features/diet/types/diet';
import { apiSlice } from '@/store/api/apiSlice';

export const dietApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Nutrients ---

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchNutrients: builder.query<Nutrient[], void>({
      query: () => '/api/diet/nutrients/',
      providesTags: ['Nutrients'],
    }),

    fetchNutrient: builder.query<Nutrient, number>({
      query: (id) => `/api/diet/nutrients/${String(id)}/`,
      providesTags: (_result, _error, id) => [{ type: 'Nutrients', id }],
    }),

    createNutrient: builder.mutation<Nutrient, CreateNutrientPayload>({
      query: (body) => ({
        url: '/api/diet/nutrients/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Nutrients'],
    }),

    updateNutrient: builder.mutation<Nutrient, { id: number; data: UpdateNutrientPayload }>({
      query: ({ id, data }) => ({
        url: `/api/diet/nutrients/${String(id)}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Nutrients', id }, 'Nutrients'],
    }),

    deleteNutrient: builder.mutation<undefined, number>({
      query: (id) => ({
        url: `/api/diet/nutrients/${String(id)}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Nutrients'],
    }),

    // --- Ingredients ---

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchIngredients: builder.query<PaginatedResponse<Ingredient>, FetchIngredientsParams | void>({
      query: (parameters) => ({
        url: '/api/diet/ingredients/',
        params: {
          pageSize: 100,
          page: parameters?.page ?? 1,
          search: parameters?.search ?? undefined,
          // eslint-disable-next-line camelcase
          nutrient_values__nutrient: parameters?.nutrientId ?? undefined,
          ordering: parameters?.ordering,
        },
      }),
      providesTags: ['Ingredients'],
    }),

    fetchIngredient: builder.query<Ingredient, number>({
      query: (id) => `/api/diet/ingredients/${String(id)}/`,
      providesTags: (_result, _error, id) => [{ type: 'Ingredients', id }],
    }),

    createIngredient: builder.mutation<Ingredient, CreateIngredientPayload>({
      query: (body) => ({
        url: '/api/diet/ingredients/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ingredients'],
    }),

    updateIngredient: builder.mutation<Ingredient, { id: number; data: UpdateIngredientPayload }>({
      query: ({ id, data }) => ({
        url: `/api/diet/ingredients/${String(id)}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Ingredients', id }, 'Ingredients'],
    }),

    deleteIngredient: builder.mutation<undefined, number>({
      query: (id) => ({
        url: `/api/diet/ingredients/${String(id)}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ingredients'],
    }),

    // --- Recipes ---
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchRecipes: builder.query<Recipe[], void>({
      query: () => '/api/diet/recipes/',
      providesTags: ['Recipes'],
    }),
    fetchRecipe: builder.query<Recipe, number>({
      query: (id) => `/api/diet/recipes/${String(id)}/`,
      providesTags: (_result, _error, id) => [{ type: 'Recipes', id }],
    }),
    createRecipe: builder.mutation<Recipe, CreateRecipePayload>({
      query: (body) => ({
        url: '/api/diet/recipes/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Recipes'],
    }),
    updateRecipe: builder.mutation<Recipe, { id: number; data: UpdateRecipePayload }>({
      query: ({ id, data }) => ({
        url: `/api/diet/recipes/${String(id)}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Recipes', id }, 'Recipes'],
    }),
    deleteRecipe: builder.mutation<undefined, number>({
      query: (id) => ({
        url: `/api/diet/recipes/${String(id)}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recipes'],
    }),

    // --- Weekly Plans ---
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchPlans: builder.query<Plan[], FetchPlansParams | void>({
      query: (parameters) => ({
        url: '/api/diet/plans/',
        params: parameters ?? {},
      }),
      providesTags: ['Plans'],
    }),

    fetchPlan: builder.query<Plan, number>({
      query: (id) => `/api/diet/plans/${String(id)}/`,
      providesTags: (_result, _error, id) => [{ type: 'Plans', id }],
    }),

    createPlan: builder.mutation<Plan, CreatePlanPayload>({
      query: (body) => ({
        url: '/api/diet/plans/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Plans'],
    }),

    updatePlan: builder.mutation<Plan, { id: number; data: UpdatePlanPayload }>({
      query: ({ id, data }) => ({
        url: `/api/diet/plans/${String(id)}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Plans', id }, 'Plans'],
    }),

    deletePlan: builder.mutation<undefined, number>({
      query: (id) => ({
        url: `/api/diet/plans/${String(id)}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Plans'],
    }),

    // --- Plan Meals ---
    createPlanMeal: builder.mutation<PlanMeal, CreatePlanMealPayload>({
      query: (body) => ({
        url: '/api/diet/plan-meals/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Plans'],
    }),

    updatePlanMeal: builder.mutation<PlanMeal, { id: number; data: UpdatePlanMealPayload }>({
      query: ({ id, data }) => ({
        url: `/api/diet/plan-meals/${String(id)}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Plans'],
    }),

    deletePlanMeal: builder.mutation<undefined, number>({
      query: (id) => ({
        url: `/api/diet/plan-meals/${String(id)}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Plans'],
    }),

    // --- Nutrient Targets ---
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchTargets: builder.query<UserNutrientTarget[], void>({
      query: () => '/api/diet/targets/',
      providesTags: ['Targets'],
    }),
    createTarget: builder.mutation<UserNutrientTarget, CreateTargetPayload>({
      query: (body) => ({
        url: '/api/diet/targets/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Targets'],
    }),
    updateTarget: builder.mutation<UserNutrientTarget, { id: number; data: UpdateTargetPayload }>({
      query: ({ id, data }) => ({
        url: `/api/diet/targets/${String(id)}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Targets'],
    }),
    resetTarget: builder.mutation<UserNutrientTarget, number>({
      query: (id) => ({
        url: `/api/diet/targets/${String(id)}/reset/`,
        method: 'POST',
      }),
      invalidatesTags: ['Targets'],
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    resetAllTargets: builder.mutation<UserNutrientTarget[], void>({
      query: () => ({
        url: '/api/diet/targets/reset_all/',
        method: 'POST',
      }),
      invalidatesTags: ['Targets'],
    }),

    fetchPlanSummary: builder.query<PlanSummary, number>({
      query: (planId) => `/api/diet/plans/${String(planId)}/summary/`,
      providesTags: ['Plans', 'Targets'],
    }),
  }),
});

const selectNutrientsResult = dietApi.endpoints.fetchNutrients.select();

export const selectNutrientsRecord = createSelector(
  selectNutrientsResult,
  (result): Record<number, Nutrient> => {
    const record: Record<number, Nutrient> = {};
    if (!result.data) return record;
    for (const nutrient of result.data) {
      record[nutrient.id] = nutrient;
    }
    return record;
  },
);

export const {
  useFetchNutrientsQuery,
  useFetchNutrientQuery,
  useCreateNutrientMutation,
  useUpdateNutrientMutation,
  useDeleteNutrientMutation,
  useFetchIngredientsQuery,
  useLazyFetchIngredientsQuery,
  useFetchIngredientQuery,
  useLazyFetchIngredientQuery,
  useCreateIngredientMutation,
  useUpdateIngredientMutation,
  useDeleteIngredientMutation,
  useFetchRecipesQuery,
  useFetchRecipeQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useFetchPlansQuery,
  useFetchPlanQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useCreatePlanMealMutation,
  useUpdatePlanMealMutation,
  useDeletePlanMealMutation,
  useFetchTargetsQuery,
  useCreateTargetMutation,
  useUpdateTargetMutation,
  useResetTargetMutation,
  useResetAllTargetsMutation,
  useFetchPlanSummaryQuery,
} = dietApi;
