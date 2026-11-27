import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Button, Card, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { useCreatePlanMealMutation, useFetchRecipesQuery } from '@/features/diet/api/dietApi';
import type { PlanDay, Recipe } from '@/features/diet/types/diet';

interface AddMealModalProps {
  planDay: PlanDay;
  onClose: () => void;
}

const AddMealModal: FC<AddMealModalProps> = ({ planDay, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  const nextOrder = Math.max(0, ...planDay.meals.map((meal) => meal.order)) + 1;
  const dayName = planDay.dayName;

  const { data: recipes = [], isLoading: isRecipesLoading } = useFetchRecipesQuery();
  const [createPlanMeal, { isLoading: isCreating }] = useCreatePlanMealMutation();

  const filteredRecipes = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return recipes;

    return recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(normalizedTerm) ||
        recipe.notes.toLowerCase().includes(normalizedTerm),
    );
  }, [recipes, searchTerm]);

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedRecipeId),
    [recipes, selectedRecipeId],
  );

  const handleSelect = (recipe: Recipe): void => {
    setSelectedRecipeId(recipe.id);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedRecipeId) {
      toast.warn('Please select a recipe.');
      return;
    }

    try {
      await createPlanMeal({
        planDay: planDay.id,
        recipe: selectedRecipeId,
        order: nextOrder,
      }).unwrap();

      toast.success(`Scheduled "${selectedRecipe?.name ?? 'recipe'}" for ${dayName}!`);
      handleClose();
    } catch {
      toast.error('Failed to schedule meal. Please try again.');
    }
  };

  const handleClose = (): void => {
    setSearchTerm('');
    setSelectedRecipeId(null);
    onClose();
  };

  return (
    <Modal show onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">
          <i className="bi bi-calendar-plus me-2 text-primary"></i>
          Schedule Meal for {dayName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Search Input */}
        <InputGroup className="mb-3">
          <InputGroup.Text className="bg-white">
            <i className="bi bi-search text-muted"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search recipes by name..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
          />
          {searchTerm && (
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm('');
              }}
            >
              Clear
            </Button>
          )}
        </InputGroup>

        {isRecipesLoading && (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" variant="primary" />
            <span className="ms-2 small text-muted">Loading recipes...</span>
          </div>
        )}

        {!isRecipesLoading && filteredRecipes.length === 0 && (
          <div className="text-center py-4 text-muted small">
            {searchTerm
              ? `No recipes matching "${searchTerm}".`
              : 'No recipes found. Create some recipes first in the Recipes section!'}
          </div>
        )}

        {!isRecipesLoading && filteredRecipes.length > 0 && (
          <div
            style={{ maxHeight: '280px', overflowY: 'auto' }}
            className="border rounded p-2 mb-3 bg-light"
          >
            {filteredRecipes.map((recipe) => {
              const isSelected = recipe.id === selectedRecipeId;

              return (
                <Card
                  key={recipe.id}
                  className={`mb-2 cursor-pointer transition-all ${
                    isSelected ? 'border-primary bg-primary-subtle shadow-sm' : 'border-0 bg-white'
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    handleSelect(recipe);
                  }}
                >
                  <Card.Body className="p-2 px-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark">{recipe.name}</div>
                      {recipe.notes && (
                        <small
                          className="text-muted text-truncate d-block"
                          style={{ maxWidth: '420px' }}
                        >
                          {recipe.notes}
                        </small>
                      )}
                    </div>
                    {recipe.ingredients.length > 0 && (
                      <span className="badge bg-light text-muted border">
                        {recipe.ingredients.length}{' '}
                        {recipe.ingredients.length === 1 ? 'ingredient' : 'ingredients'}
                      </span>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}

        {selectedRecipe && (
          <div className="alert alert-primary py-2 px-3 mb-0 small d-flex justify-content-between align-items-center">
            <span>
              Selected: <strong>{selectedRecipe.name}</strong> (Slot #{nextOrder})
            </span>
            <span className="text-muted">{selectedRecipe.ingredients.length} ingredients</span>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!selectedRecipeId || isCreating}
          onClick={() => {
            void handleSubmit();
          }}
        >
          {isCreating ? 'Scheduling...' : 'Add Meal to Day'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddMealModal;
