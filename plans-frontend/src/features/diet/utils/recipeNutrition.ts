import type { CalculatedNutrient, Ingredient, Nutrient } from '@/features/diet/types/diet';

export interface RecipeIngredientPortion {
  ingredient: Ingredient;
  amountGrams: number;
}
export interface RecipeNutritionSummary {
  totalWeightGrams: number;
  nutrients: CalculatedNutrient[];
}

export const computeRecipeNutrition = (
  portions: RecipeIngredientPortion[],
  nutrientsById: Record<number, Nutrient>,
): RecipeNutritionSummary => {
  let totalWeightGrams = 0;
  const nutrientTotalsById = new Map<number, { nutrient: Nutrient; rawAmount: number }>();

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
        existingTotal.rawAmount += contributedAmount;
      } else {
        nutrientTotalsById.set(nutrientId, {
          nutrient,
          rawAmount: contributedAmount,
        });
      }
    }
  }

  const nutrients: CalculatedNutrient[] = [...nutrientTotalsById.values()].map(
    ({ nutrient, rawAmount }) => ({
      nutrient,
      amount: String(Math.round(rawAmount * 100) / 100),
    }),
  );

  return {
    totalWeightGrams,
    nutrients,
  };
};
