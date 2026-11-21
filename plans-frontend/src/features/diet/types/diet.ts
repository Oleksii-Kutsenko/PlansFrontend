export const NUTRIENT_CATEGORIES = ['macro', 'fat', 'mineral', 'vitamin'] as const;
export type NutrientCategory = (typeof NUTRIENT_CATEGORIES)[number];

export type NutrientUnit = 'g' | 'mg' | 'mcg' | 'kcal';

export interface Nutrient {
  id: number;
  name: string;
  displayName: string;
  unit: NutrientUnit;
  category: NutrientCategory;
}

export interface CreateNutrientPayload {
  name: string;
  displayName: string;
  unit: NutrientUnit;
  category: NutrientCategory;
}

export type UpdateNutrientPayload = Partial<CreateNutrientPayload>;

export interface IngredientNutrient {
  id: number;
  nutrient: number;
  nutrientName: string;
  nutrientDisplayName: string;
  nutrientUnit: NutrientUnit;
  nutrientCategory: NutrientCategory;
  amountPer100g: number;
}

export interface Ingredient {
  id: number;
  name: string;
  nutrientMap: Record<string, number> | null;
}

export interface CreateIngredientPayload {
  name: string;
  nutrientValues?: {
    nutrient: number;
    amountPer100g: string;
  }[];
}

export type UpdateIngredientPayload = Partial<CreateIngredientPayload>;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FetchIngredientsParams {
  search?: string;
  page?: number;
  nutrientId?: number | null;
  ordering?: string | undefined;
}

export interface RecipeIngredientItem {
  id: number;
  ingredient: number;
  ingredientName: string;
  amountGrams: number;
}

export interface CalculatedNutrient {
  nutrient: Nutrient;
  amount: string;
}

export interface Recipe {
  id: number;
  name: string;
  notes: string;
  ingredients: RecipeIngredientItem[];
  calculatedNutrients: CalculatedNutrient[];
}

export interface CreateRecipeIngredientPayload {
  ingredient: number;
  amountGrams: number;
}

export interface CreateRecipePayload {
  name: string;
  notes?: string;
  ingredients?: CreateRecipeIngredientPayload[];
}

export type UpdateRecipePayload = Partial<CreateRecipePayload>;

// --- Weekly Meal Plans ---
export interface PlanMeal {
  id: number;
  planDay: number;
  recipe: number;
  recipeName: string;
  order: number;
}
export interface CreatePlanMealPayload {
  planDay: number;
  recipe: number;
  order: number;
}
export interface UpdatePlanMealPayload {
  order?: number;
  recipe?: number;
}
export interface PlanDay {
  id: number;
  plan: number;
  dayOfWeek: number; // 0 = Mon, ..., 6 = Sun
  dayName: string;
  meals: PlanMeal[];
}
export interface CreatePlanDayPayload {
  plan: number;
  dayOfWeek: number;
}
export interface Plan {
  id: number;
  name: string;
  isDefault: boolean;
  days: PlanDay[];
}
export interface FetchPlansParams {
  isDefault?: boolean;
}
export interface CreatePlanPayload {
  name: string;
  isDefault?: boolean;
}
export interface UpdatePlanPayload {
  name?: string;
  isDefault?: boolean;
}

export interface UserNutrientTarget {
  id: number;
  nutrient: number;
  nutrientName: string;
  nutrientDisplayName: string;
  nutrientUnit: NutrientUnit;
  nutrientCategory: NutrientCategory;
  weeklyTarget: string;
}
export interface CreateTargetPayload {
  nutrient: number;
  weeklyTarget: string;
}
export type UpdateTargetPayload = Partial<CreateTargetPayload>;

export interface PlanSummaryItem {
  nutrientId: number;
  name: string;
  displayName: string;
  unit: NutrientUnit;
  category: NutrientCategory;
  actualAmount: number;
  targetAmount: number;
  fulfillmentPercent: number;
  accuracyScore: number;
}

export interface PlanSummary {
  planId: number;
  planName: string;
  reassuranceScore: number;
  items: PlanSummaryItem[];
}
