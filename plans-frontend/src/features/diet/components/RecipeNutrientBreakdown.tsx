import type { FC } from 'react';
import { Badge, Card, Col, Row } from 'react-bootstrap';

import type { CalculatedNutrient, NutrientCategory } from '@/features/diet/types/diet';

import {
  CATEGORY_BADGES,
  CATEGORY_LABELS,
  formatNutrientAmount,
  NUTRIENT_CATEGORIES,
} from '../utils/recipeNutrition';

interface RecipeNutrientBreakdownProps {
  calculatedNutrients: CalculatedNutrient[];
  totalWeightGrams?: number;
}

export const RecipeNutrientBreakdown: FC<RecipeNutrientBreakdownProps> = ({
  calculatedNutrients,
  totalWeightGrams,
}) => {
  if (calculatedNutrients.length === 0) {
    return (
      <div className="p-3 text-muted fst-italic bg-light rounded text-center">
        No nutrients to display. Add ingredients with gram amounts to view nutritional values.
      </div>
    );
  }

  const nutrientsByCategory = Object.fromEntries(
    NUTRIENT_CATEGORIES.map((cat) => [cat, [] as CalculatedNutrient[]]),
  ) as Record<NutrientCategory, CalculatedNutrient[]>;

  for (const item of calculatedNutrients) {
    const category = item.nutrient.category;
    if (category in nutrientsByCategory) {
      nutrientsByCategory[category].push(item);
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      {totalWeightGrams !== undefined && totalWeightGrams > 0 && (
        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small fw-medium">Total Recipe Weight:</span>
          <Badge bg="light" text="dark" className="border fs-6">
            {totalWeightGrams} g
          </Badge>
        </div>
      )}

      <Row className="g-3">
        {NUTRIENT_CATEGORIES.map((category) => {
          const categoryItems = nutrientsByCategory[category];
          if (categoryItems.length === 0) {
            return null;
          }

          return (
            <Col key={category} xs={12} md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Header className="py-2 bg-white d-flex justify-content-between align-items-center">
                  <span className="fw-semibold small">{CATEGORY_LABELS[category]}</span>
                  <Badge bg={CATEGORY_BADGES[category]} pill>
                    {categoryItems.length}
                  </Badge>
                </Card.Header>
                <Card.Body className="p-2">
                  <ul className="list-unstyled mb-0">
                    {categoryItems.map((item) => (
                      <li
                        key={item.nutrient.id}
                        className="d-flex justify-content-between align-items-center py-1 border-bottom border-light small"
                      >
                        <span className="text-secondary">{item.nutrient.name}</span>
                        <span className="fw-medium">
                          {formatNutrientAmount(item.amount)} {item.nutrient.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default RecipeNutrientBreakdown;
