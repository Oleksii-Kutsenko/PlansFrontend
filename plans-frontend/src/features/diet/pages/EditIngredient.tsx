import { type FC, useEffect } from 'react';
import { Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useFetchIngredientQuery, useUpdateIngredientMutation } from '../api/dietApi';
import { type IngredientFormValues, NutrientGridInput } from '../components/NutrientGridInput';

export const EditIngredient: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ingredientId = Number(id);

  const {
    data: ingredient,
    isLoading: isFetching,
    isError: isFetchError,
  } = useFetchIngredientQuery(ingredientId);

  const [updateIngredient, { isLoading: isUpdating }] = useUpdateIngredientMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    defaultValues: {
      name: '',
      nutrients: {},
    },
  });

  useEffect(() => {
    if (ingredient) {
      const nutrients: Record<string, string> = {};
      if (ingredient.nutrientMap) {
        for (const [nutrientId, amount] of Object.entries(ingredient.nutrientMap)) {
          nutrients[nutrientId] = String(amount);
        }
      }
      reset({
        name: ingredient.name,
        nutrients,
      });
    }
  }, [ingredient, reset]);

  const onFormSubmit = async (data: IngredientFormValues): Promise<void> => {
    const trimmedName = data.name.trim();

    const payloadNutrients = Object.entries(data.nutrients)
      .map(([nId, amount]) => ({
        nutrient: Number(nId),
        amountPer100g: amount.trim(),
      }))
      .filter((item) => item.amountPer100g !== '' && Number(item.amountPer100g) > 0);

    try {
      await updateIngredient({
        id: ingredientId,
        data: {
          name: trimmedName,
          nutrientValues: payloadNutrients,
        },
      }).unwrap();

      toast.success(`Updated "${trimmedName}" successfully!`);
      void navigate('/diet/ingredients');
    } catch {
      toast.error('Failed to update ingredient. Please verify the input values.');
    }
  };

  if (isFetching) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading ingredient...</span>
        </Spinner>
      </Container>
    );
  }

  if (isFetchError || !ingredient) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">
          Failed to load ingredient. It might have been deleted.
        </div>
        <Link to="/diet/ingredients" className="btn btn-outline-secondary mt-2">
          Back to Ingredients
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: '960px' }}>
      <div className="mb-4">
        <Link
          to="/diet/ingredients"
          className="text-decoration-none text-secondary d-inline-flex align-items-center mb-2"
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Ingredients
        </Link>
        <h2 className="fw-bold mb-1">Edit Ingredient: {ingredient.name}</h2>
        <p className="text-muted mb-0">Update the ingredient name or nutritional profile.</p>
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
                    placeholder="e.g. Rolled Oats"
                    disabled={isUpdating}
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
            Modify values for nutrients present in this ingredient. Empty or zero fields will be
            omitted.
          </p>
          <NutrientGridInput register={register} disabled={isUpdating} />
        </div>

        <div className="d-flex justify-content-end gap-2 pb-5">
          <Button
            variant="outline-secondary"
            disabled={isUpdating}
            onClick={() => {
              void navigate('/diet/ingredients');
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditIngredient;
