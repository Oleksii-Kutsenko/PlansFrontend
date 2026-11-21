import type { FC } from 'react';
import { Badge, Button, Card, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import type { Recipe } from '@/features/diet/types/diet';

interface RecipeTableProps {
  recipes: Recipe[];
  onDelete: (recipe: Recipe) => void;
}

const RecipeTable: FC<RecipeTableProps> = ({ recipes, onDelete }) => {
  return (
    <Card className="shadow-sm border-0 overflow-hidden">
      <Table responsive hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th>Recipe Name</th>
            <th>Notes</th>
            <th>Ingredients</th>
            <th className="text-end" style={{ width: '160px' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe.id}>
              <td>
                <Link
                  to={`/diet/recipes/${String(recipe.id)}`}
                  className="fw-semibold text-dark text-decoration-none"
                >
                  {recipe.name}
                </Link>
              </td>
              <td className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                {recipe.notes || '—'}
              </td>
              <td>
                <Badge bg="secondary" pill>
                  {recipe.ingredients.length} items
                </Badge>
              </td>
              <td className="text-end">
                <Link
                  to={`/diet/recipes/${String(recipe.id)}`}
                  className="btn btn-sm btn-outline-primary me-1"
                  title="View details"
                >
                  <i className="bi bi-eye"></i>
                </Link>
                <Link
                  to={`/diet/recipes/${String(recipe.id)}/edit`}
                  className="btn btn-sm btn-outline-secondary me-1"
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
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default RecipeTable;
