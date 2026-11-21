import type {
  Ingredient,
  Nutrient,
  NutrientCategory,
  NutrientUnit,
} from '@/features/diet/types/diet';

export interface RecipeIngredientPortion {
  ingredient: Ingredient;
  amountGrams: number;
}

export interface ComputedNutrient {
  nutrient: Nutrient;
  amount: number;
  formattedAmount: string;
}

export interface RecipeNutritionSummary {
  totalWeightGrams: number;
  nutrients: ComputedNutrient[];
}

export const NUTRIENT_CATEGORIES: readonly NutrientCategory[] = [
  'macro',
  'fat',
  'mineral',
  'vitamin',
] as const;

export const CATEGORY_LABELS: Record<NutrientCategory, string> = {
  macro: 'Macronutrients',
  fat: 'Fats',
  mineral: 'Minerals',
  vitamin: 'Vitamins',
};

export const CATEGORY_BADGES: Record<NutrientCategory, string> = {
  macro: 'primary',
  fat: 'warning',
  mineral: 'success',
  vitamin: 'info',
};

export const NUTRIENT_UNITS: readonly NutrientUnit[] = ['g', 'mg', 'mcg', 'kcal'] as const;

export const formatNutrientAmount = (amount: string | number): string => {
  const numericAmount = typeof amount === 'number' ? amount : Number.parseFloat(amount);
  if (Number.isNaN(numericAmount)) {
    return String(amount);
  }
  return String(Number(numericAmount.toFixed(2)));
};

export const computeRecipeNutrition = (
  portions: RecipeIngredientPortion[],
  nutrientsById: Record<number, Nutrient>,
): RecipeNutritionSummary => {
  let totalWeightGrams = 0;
  const nutrientTotalsById = new Map<number, { nutrient: Nutrient; amount: number }>();

  for (const { ingredient, amountGrams } of portions) {
    if (!ingredient.nutrientMap) {
      continue;
    }
    totalWeightGrams += amountGrams;
    const portionMultiplier = amountGrams / 100;

    for (const [nutrientIdStr, rawAmount] of Object.entries(ingredient.nutrientMap)) {
      if (rawAmount <= 0) {
        continue;
      }

      const nutrientId = Number(nutrientIdStr);
      const nutrient = nutrientsById[nutrientId];
      if (!nutrient) {
        continue;
      }

      const contributedAmount = rawAmount * portionMultiplier;
      const existingTotal = nutrientTotalsById.get(nutrientId);

      if (existingTotal) {
        existingTotal.amount += contributedAmount;
      } else {
        nutrientTotalsById.set(nutrientId, {
          nutrient,
          amount: contributedAmount,
        });
      }
    }
  }

  const computedNutrients: ComputedNutrient[] = [...nutrientTotalsById.values()].map(
    ({ nutrient, amount }) => ({
      nutrient,
      amount,
      formattedAmount: formatNutrientAmount(amount),
    }),
  );

  return {
    totalWeightGrams,
    nutrients: computedNutrients,
  };
};
