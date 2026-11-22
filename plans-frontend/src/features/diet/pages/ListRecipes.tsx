import { type FC, useMemo, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import ConfirmModal from '@/components/ConfirmModal';
import type { Recipe } from '@/features/diet/types/diet';

import { useDeleteRecipeMutation, useFetchRecipesQuery } from '../api/dietApi';
import RecipeGrid from '../components/RecipeGrid';
import RecipeTable from '../components/RecipeTable';

export const ListRecipes: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  const { data: recipes, isLoading, isError } = useFetchRecipesQuery();
  const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation();

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return recipes;
    return recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(normalizedTerm) ||
        recipe.notes.toLowerCase().includes(normalizedTerm),
    );
  }, [recipes, searchTerm]);

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteTarget) return;

    try {
      await deleteRecipe(deleteTarget.id).unwrap();
      toast.success(`Recipe "${deleteTarget.name}" deleted successfully!`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete recipe. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading recipes...</span>
        </Spinner>
      </Container>
    );
  }

  if (isError || !recipes) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger" role="alert">
          Failed to load recipes. Please check your connection and try again.
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Recipes</h2>
          <small className="text-muted">
            Manage your meal recipes, compositions, and nutritional totals
          </small>
        </div>
        <Link to="/diet/recipes/create" className="btn btn-primary shadow-sm">
          <i className="bi bi-plus-lg me-1"></i> Create Recipe
        </Link>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col xs={12} sm={8} md={9}>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search recipes by name or notes..."
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
            </Col>
            <Col xs={12} sm={4} md={3} className="text-sm-end">
              <ButtonGroup size="sm">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                  onClick={() => {
                    setViewMode('grid');
                  }}
                  title="Grid view"
                >
                  <i className="bi bi-grid me-1"></i> Grid
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'outline-secondary'}
                  onClick={() => {
                    setViewMode('table');
                  }}
                  title="Table view"
                >
                  <i className="bi bi-list-ul me-1"></i> Table
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredRecipes.length === 0 && (
        <Card className="text-center py-5 border-dashed">
          <Card.Body>
            <i className="bi bi-journal-text fs-1 text-muted d-block mb-3"></i>
            {searchTerm ? (
              <p className="text-muted mb-0">No recipes match &quot;{searchTerm}&quot;.</p>
            ) : (
              <>
                <p className="text-muted mb-3">You haven&apos;t created any recipes yet.</p>
                <Link to="/diet/recipes/create" className="btn btn-outline-primary">
                  <i className="bi bi-plus-lg me-1"></i> Create Your First Recipe
                </Link>
              </>
            )}
          </Card.Body>
        </Card>
      )}
      {filteredRecipes.length > 0 && viewMode === 'grid' && (
        <RecipeGrid recipes={filteredRecipes} onDelete={setDeleteTarget} />
      )}
      {filteredRecipes.length > 0 && viewMode === 'table' && (
        <RecipeTable recipes={filteredRecipes} onDelete={setDeleteTarget} />
      )}

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${deleteTarget?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteTarget(null);
        }}
      />
    </Container>
  );
};

export default ListRecipes;
