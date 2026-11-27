import type { FC } from 'react';
import { useMemo } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useDeletePlanMealMutation, useUpdatePlanMealMutation } from '@/features/diet/api/dietApi';
import type {
  NutrientRecipeContribution,
  PlanDay,
  PlanMeal,
  PlanSummaryItem,
} from '@/features/diet/types/diet';

interface DayColumnProps {
  planDay: PlanDay;
  focusedNutrient: PlanSummaryItem | null;
  onAddMeal: (planDay: PlanDay) => void;
}

const getMealHighlight = (
  meal: PlanMeal,
  focusedNutrient: PlanSummaryItem | null,
  contributionsByRecipeId: Map<number, NutrientRecipeContribution>,
): {
  contributor: NutrientRecipeContribution | undefined;
  cardClassName: string;
  sharePercent: number;
} => {
  if (!focusedNutrient) {
    return {
      contributor: undefined,
      cardClassName: 'mb-1 bg-white border border-white shadow-sm',
      sharePercent: 0,
    };
  }

  const contributor = contributionsByRecipeId.get(meal.recipe);
  if (!contributor) {
    return {
      contributor: undefined,
      cardClassName: 'mb-1 bg-white border border-white shadow-sm opacity-50',
      sharePercent: 0,
    };
  }

  const sharePercent =
    focusedNutrient.actualAmount > 0
      ? Math.round((contributor.perMealAmount / focusedNutrient.actualAmount) * 100)
      : 0;

  return {
    contributor,
    cardClassName: 'mb-1 bg-white border border-primary shadow-sm',
    sharePercent,
  };
};

const DayColumn: FC<DayColumnProps> = ({ planDay, focusedNutrient, onAddMeal }) => {
  const [updatePlanMeal, { isLoading: isUpdating }] = useUpdatePlanMealMutation();
  const [deletePlanMeal] = useDeletePlanMealMutation();

  const sortedMeals = useMemo(
    () => planDay.meals.toSorted((firstMeal, secondMeal) => firstMeal.order - secondMeal.order),
    [planDay.meals],
  );

  const contributorByRecipeId = useMemo(() => {
    const contributionsByRecipeId = new Map<number, NutrientRecipeContribution>();
    if (!focusedNutrient) return contributionsByRecipeId;

    for (const recipeContribution of focusedNutrient.contributors) {
      contributionsByRecipeId.set(recipeContribution.recipeId, recipeContribution);
    }
    return contributionsByRecipeId;
  }, [focusedNutrient]);

  const handleMoveMeal = async (meal: PlanMeal, direction: 'up' | 'down'): Promise<void> => {
    const index = sortedMeals.indexOf(meal);
    const targetMeal = sortedMeals[direction === 'up' ? index - 1 : index + 1];
    if (!targetMeal) return;

    try {
      await updatePlanMeal({ id: meal.id, data: { order: targetMeal.order } }).unwrap();
    } catch {
      toast.error('Failed to reorder meal.');
    }
  };

  const handleDeleteMeal = async (meal: PlanMeal): Promise<void> => {
    try {
      await deletePlanMeal(meal.id).unwrap();
      toast.success(`Removed meal from ${planDay.dayName}`);
    } catch {
      toast.error('Failed to remove meal.');
    }
  };

  const handleAddMealClick = (): void => {
    onAddMeal(planDay);
  };

  return (
    <div className="d-flex flex-column bg-light rounded border shadow-sm p-2 w-100 h-100 min-w-0">
      {/* Day Header */}
      <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
        <h6 className="mb-0 fw-bold text-dark">{planDay.dayName}</h6>
        <span className="badge bg-secondary">
          {sortedMeals.length} {sortedMeals.length === 1 ? 'meal' : 'meals'}
        </span>
      </div>

      {/* Scheduled Meals List */}
      <div className="flex-grow-1 pe-1">
        {sortedMeals.length === 0 ? (
          <div className="text-center py-2 text-muted small">No meals planned</div>
        ) : (
          sortedMeals.map((meal, index) => {
            const { contributor, cardClassName, sharePercent } = getMealHighlight(
              meal,
              focusedNutrient,
              contributorByRecipeId,
            );
            const contributionTitle =
              focusedNutrient && contributor
                ? `${String(contributor.perMealAmount)} ${focusedNutrient.unit} (${String(sharePercent)}% of ${focusedNutrient.displayName})`
                : undefined;

            return (
              <Card key={meal.id} className={cardClassName}>
                <Card.Body className="py-1 px-2">
                  <div className="d-flex justify-content-between align-items-center gap-1">
                    <div className="flex-grow-1 min-w-0 text-truncate">
                      <span className="badge bg-light text-dark border me-1 small">
                        #{meal.order}
                      </span>
                      <Link
                        to={`/diet/recipes/${String(meal.recipe)}`}
                        className="fw-semibold text-dark text-decoration-none small"
                        title={meal.recipeName}
                      >
                        {meal.recipeName}
                      </Link>
                    </div>

                    {/* Move & Remove Controls */}
                    <div className="d-flex align-items-center gap-1 flex-shrink-0">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-muted"
                        disabled={isUpdating || index === 0}
                        title="Move Up"
                        onClick={() => void handleMoveMeal(meal, 'up')}
                      >
                        <i className="bi bi-arrow-up"></i>
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-muted"
                        disabled={isUpdating || index === sortedMeals.length - 1}
                        title="Move Down"
                        onClick={() => void handleMoveMeal(meal, 'down')}
                      >
                        <i className="bi bi-arrow-down"></i>
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-danger"
                        title="Remove meal"
                        onClick={() => void handleDeleteMeal(meal)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </Button>
                    </div>
                  </div>

                  <div
                    className="text-truncate text-primary fw-semibold"
                    style={{ fontSize: '11px', height: '16px', lineHeight: '16px' }}
                    title={contributionTitle}
                  >
                    {focusedNutrient && contributor && (
                      <>
                        {contributor.perMealAmount} {focusedNutrient.unit}
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Meal Trigger */}
      <Button
        variant="outline-primary"
        size="sm"
        className="w-100 mt-2 py-1 shadow-sm d-flex align-items-center justify-content-center gap-1"
        onClick={handleAddMealClick}
      >
        <i className="bi bi-plus-lg"></i>
        Add Meal
      </Button>
    </div>
  );
};

export default DayColumn;
