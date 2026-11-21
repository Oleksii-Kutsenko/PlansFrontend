import type { FC } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import type { CreateRecipePayload } from '@/features/diet/types/diet';

import { useCreateRecipeMutation } from '../api/dietApi';
import RecipeForm from '../components/RecipeForm';

export const CreateRecipe: FC = () => {
  const navigate = useNavigate();
  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();

  const handleCreateSubmit = async (payload: CreateRecipePayload): Promise<void> => {
    try {
      const createdRecipe = await createRecipe(payload).unwrap();
      toast.success(`Created recipe "${createdRecipe.name}" successfully!`);
      void navigate(`/diet/recipes/${String(createdRecipe.id)}`);
    } catch {
      toast.error('Failed to create recipe. Please check your input.');
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: '960px' }}>
      <div className="mb-4">
        <Link
          to="/diet/recipes"
          className="text-decoration-none text-secondary d-inline-flex align-items-center mb-2"
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Recipes
        </Link>
        <h2 className="fw-bold mb-1">Create Recipe</h2>
        <small className="text-muted">
          Combine ingredients to build a meal recipe and compute its nutritional profile
        </small>
      </div>

      <RecipeForm
        isSubmitting={isCreating}
        submitButtonLabel="Create Recipe"
        onSubmit={handleCreateSubmit}
      />
    </Container>
  );
};

export default CreateRecipe;
