import type { FC } from 'react';
import { Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useCreateIngredientMutation } from '../api/dietApi';
import { type IngredientFormValues, NutrientGridInput } from '../components/NutrientGridInput';

export const CreateIngredient: FC = () => {
  const navigate = useNavigate();
  const [createIngredient, { isLoading: isSubmitting }] = useCreateIngredientMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    defaultValues: {
      name: '',
      nutrients: {},
    },
  });

  const onFormSubmit = async (data: IngredientFormValues): Promise<void> => {
    const payloadNutrients = Object.entries(data.nutrients)
      .filter(([, amount]) => Number(amount) > 0)
      .map(([id, amount]) => ({
        nutrient: Number(id),
        amountPer100g: amount,
      }));

    try {
      await createIngredient({
        name: data.name.trim(),
        nutrientValues: payloadNutrients,
      }).unwrap();

      toast.success(`Created "${data.name.trim()}" successfully!`);
      void navigate('/diet/ingredients');
    } catch {
      toast.error('Failed to create ingredient. Please verify the input values.');
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: '960px' }}>
      <div className="mb-4">
        <Link
          to="/diet/ingredients"
          className="text-decoration-none text-secondary d-inline-flex align-items-center mb-2"
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Ingredients
        </Link>
        <h2 className="fw-bold mb-1">Add New Ingredient</h2>
        <p className="text-muted mb-0">
          Enter the ingredient name and its nutrient values per 100 grams.
        </p>
      </div>

      <Form
        noValidate
        onSubmit={(e) => {
          void handleSubmit(onFormSubmit)(e);
        }}
      >
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-semibold mb-3">General Information</h5>
            <Row>
              <Col xs={12} md={8}>
                <Form.Group controlId="ingredientName">
                  <Form.Label className="fw-medium">Ingredient Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Rolled Oats, Greek Yogurt, Olive Oil"
                    disabled={isSubmitting}
                    isInvalid={Boolean(errors.name)}
                    {...register('name', { required: 'Please provide an ingredient name.' })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="mb-4">
          <h5 className="fw-semibold mb-2">Nutritional Profile (per 100g)</h5>
          <p className="text-muted small mb-3">
            Fill in values for the nutrients present in this ingredient. Empty or zero fields will
            be omitted.
          </p>
          <NutrientGridInput register={register} disabled={isSubmitting} />
        </div>

        <div className="d-flex justify-content-end gap-2 pb-5">
          <Button
            variant="outline-secondary"
            disabled={isSubmitting}
            onClick={() => {
              void navigate('/diet/ingredients');
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              'Save Ingredient'
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreateIngredient;
