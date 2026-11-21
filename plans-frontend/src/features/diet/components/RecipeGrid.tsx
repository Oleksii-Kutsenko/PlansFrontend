import type { FC } from 'react';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import type { Recipe } from '@/features/diet/types/diet';

interface RecipeGridProps {
  recipes: Recipe[];
  onDelete: (recipe: Recipe) => void;
}

const RecipeGrid: FC<RecipeGridProps> = ({ recipes, onDelete }) => {
  return (
    <Row className="g-3 row-cols-1 row-cols-md-2 row-cols-lg-3">
      {recipes.map((recipe) => (
        <Col key={recipe.id}>
          <Card className="h-100 shadow-sm border-0 d-flex flex-column">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="card-title fw-bold text-dark mb-0">{recipe.name}</h5>
                <Badge bg="secondary" pill>
                  {recipe.ingredients.length} ingredients
                </Badge>
              </div>
              {recipe.notes ? (
                <p className="card-text text-muted small flex-grow-1">{recipe.notes}</p>
              ) : (
                <p className="card-text text-muted small fst-italic flex-grow-1">
                  No notes provided
                </p>
              )}
              <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center">
                <Link
                  to={`/diet/recipes/${String(recipe.id)}`}
                  className="btn btn-sm btn-outline-primary"
                >
                  View Details
                </Link>
                <div className="d-flex gap-1">
                  <Link
                    to={`/diet/recipes/${String(recipe.id)}/edit`}
                    className="btn btn-sm btn-outline-secondary"
                    title="Edit recipe"
                  >
                    <i className="bi bi-pencil"></i>
                  </Link>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    title="Delete recipe"
                    onClick={() => {
                      onDelete(recipe);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default RecipeGrid;
