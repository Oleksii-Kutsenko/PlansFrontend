import { type FC, useMemo, useState } from 'react';
import { Badge, Button, Card, Container, ProgressBar, Spinner, Table } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import ConfirmModal from '@/components/ConfirmModal';

import { useDeleteRecipeMutation, useFetchRecipeQuery } from '../api/dietApi';
import { RecipeNutrientBreakdown } from '../components/RecipeNutrientBreakdown';

export const RecipeDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipeId = Number(id);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: recipe, isLoading, isError } = useFetchRecipeQuery(recipeId);

  const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation();

  const totalRecipeWeightGrams = useMemo(() => {
    if (!recipe?.ingredients) return 0;
    return recipe.ingredients.reduce(
      (accumulator, currentItem) => accumulator + currentItem.amountGrams,
      0,
    );
  }, [recipe]);

  const handleDeleteConfirm = async (): Promise<void> => {
    try {
      await deleteRecipe(recipeId).unwrap();
      toast.success('Recipe deleted successfully!');
      void navigate('/diet/recipes');
    } catch {
      toast.error('Failed to delete recipe. Please try again.');
    }
  };

  if (isLoading) {
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
        <div className="alert alert-danger">Recipe not found. It may have been deleted.</div>
        <Link to="/diet/recipes" className="btn btn-outline-secondary mt-2">
          Back to Recipes
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: '960px' }}>
      <div className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-2">
        <div>
          <Link
            to="/diet/recipes"
            className="text-decoration-none text-secondary d-inline-flex align-items-center mb-2"
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Recipes
          </Link>
          <h2 className="fw-bold mb-1">{recipe.name}</h2>
          <small className="text-muted">
            {recipe.ingredients.length} ingredients &bull; {totalRecipeWeightGrams}g total
          </small>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/diet/recipes/${String(recipeId)}/edit`} className="btn btn-outline-primary">
            <i className="bi bi-pencil me-1"></i> Edit
          </Link>
          <Button
            variant="outline-danger"
            onClick={() => {
              setIsDeleteModalOpen(true);
            }}
          >
            <i className="bi bi-trash me-1"></i> Delete
          </Button>
        </div>
      </div>

      {recipe.notes && (
        <Card className="shadow-sm border-0 mb-4 bg-light">
          <Card.Body className="p-3">
            <h6 className="fw-semibold text-secondary mb-1">Notes & Instructions</h6>
            <p className="mb-0 text-dark small" style={{ whiteSpace: 'pre-wrap' }}>
              {recipe.notes}
            </p>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm border-0 mb-4 overflow-hidden">
        <Card.Header className="bg-white py-3">
          <h5 className="fw-semibold mb-0">Ingredients Composition</h5>
        </Card.Header>
        <Table responsive hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Ingredient</th>
              <th>Weight</th>
              <th style={{ width: '40%' }}>Proportion</th>
            </tr>
          </thead>
          <tbody>
            {recipe.ingredients.map((item) => {
              const proportionPercentage =
                totalRecipeWeightGrams > 0
                  ? Math.round((item.amountGrams / totalRecipeWeightGrams) * 100)
                  : 0;

              return (
                <tr key={item.id}>
                  <td>
                    <span className="fw-medium text-dark">{item.ingredientName}</span>
                  </td>
                  <td>
                    <Badge bg="light" text="dark" className="border">
                      {item.amountGrams} g
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <ProgressBar
                        now={proportionPercentage}
                        className="flex-grow-1"
                        style={{ height: '6px' }}
                      />
                      <small className="text-muted" style={{ minWidth: '40px' }}>
                        {proportionPercentage}%
                      </small>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="table-light">
            <tr>
              <td className="fw-bold">Total Weight</td>
              <td colSpan={2} className="fw-bold">
                {totalRecipeWeightGrams} g
              </td>
            </tr>
          </tfoot>
        </Table>
      </Card>

      <Card className="shadow-sm border-0 mb-5">
        <Card.Header className="bg-white py-3">
          <h5 className="fw-semibold mb-0">Nutritional Totals</h5>
          <small className="text-muted">
            Calculated from ingredient proportions for the full recipe
          </small>
        </Card.Header>
        <Card.Body className="p-4">
          <RecipeNutrientBreakdown
            calculatedNutrients={recipe.calculatedNutrients}
            totalWeightGrams={totalRecipeWeightGrams}
          />
        </Card.Body>
      </Card>

      <ConfirmModal
        show={isDeleteModalOpen}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
        }}
      />
    </Container>
  );
};

export default RecipeDetail;
