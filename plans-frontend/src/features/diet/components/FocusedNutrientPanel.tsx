import { type FC, type ReactElement, useMemo, useState } from 'react';
import { Button, ButtonGroup, CloseButton, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import type { NutrientRecipeContribution, PlanSummaryItem } from '@/features/diet/types/diet';

interface FocusedNutrientPanelProps {
  nutrient: PlanSummaryItem;
  onClose: () => void;
}

interface AggregatedIngredient {
  ingredientId: number;
  ingredientName: string;
  totalGrams: number;
  totalAmount: number;
  recipes: NutrientRecipeContribution[];
}

const getSharePercent = (amount: number, totalAmount: number): number =>
  totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;

const formatRecipeUsage = (recipeContribution: NutrientRecipeContribution): string =>
  recipeContribution.mealCount > 1
    ? `${recipeContribution.recipeName} (×${String(recipeContribution.mealCount)})`
    : recipeContribution.recipeName;

const aggregateIngredients = (nutrient: PlanSummaryItem): AggregatedIngredient[] => {
  const aggregatedIngredientsById = new Map<number, AggregatedIngredient>();

  for (const recipeContribution of nutrient.contributors) {
    for (const ingredientContribution of recipeContribution.ingredients) {
      const existingIngredient = aggregatedIngredientsById.get(ingredientContribution.ingredientId);
      const addedGrams = ingredientContribution.gramsPerMeal * recipeContribution.mealCount;

      if (existingIngredient) {
        existingIngredient.totalGrams = Number(
          (existingIngredient.totalGrams + addedGrams).toFixed(2),
        );
        existingIngredient.totalAmount = Number(
          (existingIngredient.totalAmount + ingredientContribution.totalAmount).toFixed(4),
        );
        const hasRecipe = existingIngredient.recipes.some(
          (trackedRecipe) => trackedRecipe.recipeId === recipeContribution.recipeId,
        );
        if (!hasRecipe) {
          existingIngredient.recipes.push(recipeContribution);
        }
      } else {
        aggregatedIngredientsById.set(ingredientContribution.ingredientId, {
          ingredientId: ingredientContribution.ingredientId,
          ingredientName: ingredientContribution.ingredientName,
          totalGrams: Number(addedGrams.toFixed(2)),
          totalAmount: ingredientContribution.totalAmount,
          recipes: [recipeContribution],
        });
      }
    }
  }

  return [...aggregatedIngredientsById.values()].toSorted(
    (firstIngredient, secondIngredient) =>
      secondIngredient.totalAmount - firstIngredient.totalAmount,
  );
};

const renderRecipeTable = (nutrient: PlanSummaryItem): ReactElement => (
  <Table size="sm" hover className="mb-0 align-middle" style={{ tableLayout: 'fixed' }}>
    <colgroup>
      <col style={{ width: '25%' }} />
      <col style={{ width: '43%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '20%' }} />
    </colgroup>
    <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
      <tr>
        <th scope="col" className="small text-secondary fw-semibold">
          Recipe
        </th>
        <th scope="col" className="small text-secondary fw-semibold">
          Ingredients
        </th>
        <th scope="col" className="small text-secondary fw-semibold text-end">
          Meals
        </th>
        <th scope="col" className="small text-secondary fw-semibold text-end">
          Contribution
        </th>
      </tr>
    </thead>
    <tbody>
      {nutrient.contributors.map((recipeContribution) => {
        const sharePercent = getSharePercent(recipeContribution.totalAmount, nutrient.actualAmount);
        const hasMultipleIngredients = recipeContribution.ingredients.length > 1;

        return (
          <tr key={recipeContribution.recipeId}>
            <td className="small">
              <Link
                to={`/diet/recipes/${String(recipeContribution.recipeId)}`}
                className="fw-semibold text-dark text-decoration-none d-block text-truncate"
                title={recipeContribution.recipeName}
              >
                {recipeContribution.recipeName}
              </Link>
            </td>
            <td className="small">
              <div className="d-flex flex-column gap-1">
                {recipeContribution.ingredients.map((ingredientContribution) => {
                  const ingredientLabel = `${ingredientContribution.ingredientName} (${String(
                    ingredientContribution.gramsPerMeal,
                  )}g)`;

                  return (
                    <div
                      key={ingredientContribution.ingredientId}
                      className="d-flex justify-content-between align-items-baseline gap-2 text-muted min-w-0"
                      style={{ fontSize: '12px' }}
                    >
                      <span className="text-truncate" title={ingredientLabel}>
                        {ingredientLabel}
                      </span>
                      {hasMultipleIngredients && (
                        <span className="text-nowrap flex-shrink-0">
                          {ingredientContribution.totalAmount} {nutrient.unit}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </td>
            <td className="small text-end text-muted">
              <div className="text-nowrap">{recipeContribution.mealCount}&times;</div>
              {recipeContribution.mealCount > 1 && (
                <div className="text-nowrap" style={{ fontSize: '11px' }}>
                  {recipeContribution.perMealAmount}/meal
                </div>
              )}
            </td>
            <td className="small text-end text-nowrap">
              <span className="fw-semibold">
                {recipeContribution.totalAmount} {nutrient.unit}
              </span>{' '}
              <span className="text-muted">({sharePercent}%)</span>
            </td>
          </tr>
        );
      })}
    </tbody>
  </Table>
);

const renderIngredientTable = (
  nutrient: PlanSummaryItem,
  aggregatedIngredients: AggregatedIngredient[],
): ReactElement => (
  <Table size="sm" hover className="mb-0 align-middle" style={{ tableLayout: 'fixed' }}>
    <colgroup>
      <col style={{ width: '25%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '43%' }} />
      <col style={{ width: '20%' }} />
    </colgroup>
    <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
      <tr>
        <th scope="col" className="small text-secondary fw-semibold">
          Ingredient
        </th>
        <th scope="col" className="small text-secondary fw-semibold text-end">
          Total
        </th>
        <th scope="col" className="small text-secondary fw-semibold">
          Used In Recipes
        </th>
        <th scope="col" className="small text-secondary fw-semibold text-end">
          Contribution
        </th>
      </tr>
    </thead>
    <tbody>
      {aggregatedIngredients.map((aggregatedIngredient) => {
        const sharePercent = getSharePercent(
          aggregatedIngredient.totalAmount,
          nutrient.actualAmount,
        );

        return (
          <tr key={aggregatedIngredient.ingredientId}>
            <td className="small">
              <span
                className="fw-semibold d-block text-truncate"
                title={aggregatedIngredient.ingredientName}
              >
                {aggregatedIngredient.ingredientName}
              </span>
            </td>
            <td className="small text-end text-nowrap text-muted">
              {aggregatedIngredient.totalGrams}g
            </td>
            <td className="small">
              <div className="d-flex flex-wrap gap-2">
                {aggregatedIngredient.recipes.map((recipeContribution) => (
                  <Link
                    key={recipeContribution.recipeId}
                    to={`/diet/recipes/${String(recipeContribution.recipeId)}`}
                    className="text-decoration-none text-truncate"
                    style={{ maxWidth: '100%' }}
                  >
                    {formatRecipeUsage(recipeContribution)}
                  </Link>
                ))}
              </div>
            </td>
            <td className="small text-end text-nowrap">
              <span className="fw-semibold">
                {aggregatedIngredient.totalAmount} {nutrient.unit}
              </span>{' '}
              <span className="text-muted">({sharePercent}%)</span>
            </td>
          </tr>
        );
      })}
    </tbody>
  </Table>
);

const FocusedNutrientPanel: FC<FocusedNutrientPanelProps> = ({ nutrient, onClose }) => {
  const [viewMode, setViewMode] = useState<'recipe' | 'ingredient'>('recipe');

  const aggregatedIngredients = useMemo(() => aggregateIngredients(nutrient), [nutrient]);

  const isOverTarget = nutrient.targetAmount > 0 && nutrient.fulfillmentPercent > 100;
  const targetBadgeClass = isOverTarget ? 'bg-warning text-dark' : 'bg-secondary-subtle text-dark';

  return (
    <div className="border rounded bg-light p-2 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center gap-2 pb-2 mb-2 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center gap-2 min-w-0">
          <h6 className="fw-bold mb-0 flex-shrink-0" title={nutrient.name}>
            {nutrient.displayName}
          </h6>
          {nutrient.name !== nutrient.displayName && (
            <span className="small text-muted text-truncate" title={nutrient.name}>
              ({nutrient.name})
            </span>
          )}
          <span className="small text-muted text-nowrap flex-shrink-0">
            {nutrient.actualAmount.toFixed(1)} / {nutrient.targetAmount.toFixed(1)} {nutrient.unit}
          </span>
          {nutrient.targetAmount > 0 && (
            <span className={`badge flex-shrink-0 ${targetBadgeClass}`}>
              {Math.round(nutrient.fulfillmentPercent)}%
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <ButtonGroup size="sm">
            <Button
              variant={viewMode === 'recipe' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setViewMode('recipe');
              }}
            >
              By Recipe
            </Button>
            <Button
              variant={viewMode === 'ingredient' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setViewMode('ingredient');
              }}
            >
              By Ingredient
            </Button>
          </ButtonGroup>
          <CloseButton aria-label="Close nutrient focus view" onClick={onClose} />
        </div>
      </div>

      <div
        key={`${String(nutrient.nutrientId)}-${viewMode}`}
        className="flex-grow-1 overflow-auto bg-white border rounded"
        style={{ scrollbarGutter: 'stable' }}
      >
        {nutrient.contributors.length === 0 && (
          <div className="text-muted small p-3">
            No scheduled meals contribute to this nutrient.
          </div>
        )}

        {nutrient.contributors.length > 0 && viewMode === 'recipe' && renderRecipeTable(nutrient)}

        {nutrient.contributors.length > 0 &&
          viewMode === 'ingredient' &&
          renderIngredientTable(nutrient, aggregatedIngredients)}
      </div>
    </div>
  );
};

export default FocusedNutrientPanel;
