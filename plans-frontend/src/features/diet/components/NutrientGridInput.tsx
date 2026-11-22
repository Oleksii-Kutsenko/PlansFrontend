import type { FC } from 'react';
import { Card, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import type { UseFormRegister } from 'react-hook-form';

import { NUTRIENT_CATEGORIES, NUTRIENT_CATEGORY_KEYS } from '@/features/diet/types/diet';

import { useFetchNutrientsQuery } from '../api/dietApi';

export interface IngredientFormValues {
  name: string;
  nutrients: Record<string, string>;
}

interface NutrientGridInputProps {
  register: UseFormRegister<IngredientFormValues>;
  disabled?: boolean;
}

export const NutrientGridInput: FC<NutrientGridInputProps> = ({ register, disabled = false }) => {
  const { data: nutrients, isLoading, isError } = useFetchNutrientsQuery();

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" className="me-2" />
        <span className="text-muted">Loading nutrients catalog...</span>
      </div>
    );
  }

  if (isError || !nutrients) {
    return (
      <div className="alert alert-warning">
        Unable to load nutrients catalog. Please check your connection or refresh.
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {NUTRIENT_CATEGORY_KEYS.map((category) => {
        const sectionNutrients = nutrients.filter((nutrient) => nutrient.category === category);
        if (sectionNutrients.length === 0) return null;

        return (
          <Card key={category} className="border shadow-sm">
            <Card.Header className="bg-white py-2 d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-dark">{NUTRIENT_CATEGORIES[category].label}</span>
              <span className="badge bg-light text-secondary border">per 100g</span>
            </Card.Header>
            <Card.Body className="p-3">
              <Row className="g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                {sectionNutrients.map((nutrient) => (
                  <Col key={nutrient.id}>
                    <Form.Group controlId={`nutrient-input-${String(nutrient.id)}`}>
                      <Form.Label className="small mb-1 text-secondary text-truncate d-block">
                        {nutrient.displayName}
                      </Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          type="number"
                          step="any"
                          min="0"
                          placeholder="0"
                          disabled={disabled}
                          {...register(`nutrients.${String(nutrient.id)}`)}
                        />
                        <InputGroup.Text className="text-muted small">
                          {nutrient.unit}
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default NutrientGridInput;
