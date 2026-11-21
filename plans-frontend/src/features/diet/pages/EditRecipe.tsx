import type { FC } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import type { CreateRecipePayload } from '@/features/diet/types/diet';

import { useFetchRecipeQuery, useUpdateRecipeMutation } from '../api/dietApi';
import RecipeForm, { type RecipeFormValues } from '../components/RecipeForm';

export const EditRecipe: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipeId = Number(id);

  const { data: recipe, isLoading: isFetching, isError } = useFetchRecipeQuery(recipeId);

  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();

  const handleUpdateSubmit = async (payload: CreateRecipePayload): Promise<void> => {
    try {
      await updateRecipe({ id: recipeId, data: payload }).unwrap();
      toast.success(`Updated recipe "${payload.name}" successfully!`);
      void navigate(`/diet/recipes/${String(recipeId)}`);
    } catch {
      toast.error('Failed to update recipe. Please try again.');
    }
  };

  if (isFetching) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading recipe...</span>
        </Spinner>
      </Container>
    );
  }

  if (isError || !recipe) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">Failed to load recipe. It might have been deleted.</div>
        <Link to="/diet/recipes" className="btn btn-outline-secondary mt-2">
          Back to Recipes
        </Link>
      </Container>
    );
  }

  const initialValues: RecipeFormValues = {
    name: recipe.name,
    notes: recipe.notes,
    ingredients: recipe.ingredients.map((item) => ({
      ingredientId: item.ingredient,
      ingredientName: item.ingredientName,
      amountGrams: item.amountGrams,
    })),
  };

  return (
    <Container className="py-4" style={{ maxWidth: '960px' }}>
      <div className="mb-4">
        <Link
          to={`/diet/recipes/${String(recipeId)}`}
          className="text-decoration-none text-secondary d-inline-flex align-items-center mb-2"
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Recipe
        </Link>
        <h2 className="fw-bold mb-1">Edit Recipe: {recipe.name}</h2>
        <small className="text-muted">Update recipe composition or metadata</small>
      </div>

      <RecipeForm
        initialValues={initialValues}
        isSubmitting={isUpdating}
        submitButtonLabel="Save Changes"
        onSubmit={handleUpdateSubmit}
      />
    </Container>
  );
};

export default EditRecipe;
