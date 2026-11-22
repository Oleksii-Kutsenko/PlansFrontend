import { type FC, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import { toast } from 'react-toastify';

import type { CreateRecipePayload, Ingredient } from '@/features/diet/types/diet';

import {
  selectNutrientsRecord,
  useFetchNutrientsQuery,
  useLazyFetchIngredientQuery,
  useLazyFetchIngredientsQuery,
} from '../api/dietApi';
import { computeRecipeNutrition, type RecipeIngredientPortion } from '../utils/recipeNutrition';
import { RecipeNutrientBreakdown } from './RecipeNutrientBreakdown';

export interface InitialRecipeIngredientData {
  ingredientId: number;
  ingredientName: string;
  amountGrams: number;
}

export interface InitialRecipeFormValues {
  name: string;
  notes: string;
  ingredients: InitialRecipeIngredientData[];
}

export type RecipeFormValues = InitialRecipeFormValues;

export interface RecipeIngredientField {
  ingredient: Ingredient | null;
  amountGrams: number;
}

export interface RecipeFormData {
  name: string;
  notes: string;
  ingredients: RecipeIngredientField[];
}

interface IngredientOption {
  value: number;
  label: string;
  ingredient: Ingredient;
}

interface RecipeFormProps {
  initialValues?: InitialRecipeFormValues;
  isSubmitting: boolean;
  submitButtonLabel: string;
  onSubmit: (payload: CreateRecipePayload) => Promise<void>;
}

const RecipeForm: FC<RecipeFormProps> = ({
  initialValues,
  isSubmitting,
  submitButtonLabel,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  useFetchNutrientsQuery();
  const nutrientsById = useSelector(selectNutrientsRecord);

  const [triggerFetchIngredients] = useLazyFetchIngredientsQuery();
  const [triggerFetchIngredient] = useLazyFetchIngredientQuery();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecipeFormData>({
    defaultValues: {
      name: initialValues?.name ?? '',
      notes: initialValues?.notes ?? '',
      ingredients: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  useEffect(() => {
    if (!initialValues?.ingredients || isInitialized) {
      return;
    }

    const loadInitialIngredients = async (): Promise<void> => {
      const rows: RecipeIngredientField[] = await Promise.all(
        initialValues.ingredients.map(async (item) => {
          try {
            const ingredient = await triggerFetchIngredient(item.ingredientId).unwrap();
            return { ingredient, amountGrams: item.amountGrams };
          } catch {
            const fallback: Ingredient = {
              id: item.ingredientId,
              name: item.ingredientName,
              nutrientMap: null,
            };
            return { ingredient: fallback, amountGrams: item.amountGrams };
          }
        }),
      );

      reset({
        name: initialValues.name,
        notes: initialValues.notes,
        ingredients: rows,
      });
      setIsInitialized(true);
    };

    void loadInitialIngredients();
  }, [initialValues, isInitialized, reset, triggerFetchIngredient]);

  // Dynamic async search for react-select
  const loadIngredientOptions = async (inputValue: string): Promise<IngredientOption[]> => {
    try {
      const response = await triggerFetchIngredients({
        search: inputValue.trim(),
        page: 1,
      }).unwrap();

      return response.results.map((ingredient) => ({
        value: ingredient.id,
        label: ingredient.name,
        ingredient,
      }));
    } catch {
      return [];
    }
  };

  // Watch ingredients to compute live nutrition preview
  const watchedIngredients = useWatch({ control, name: 'ingredients' });

  const validIngredientPortions: RecipeIngredientPortion[] = useMemo(() => {
    return watchedIngredients.filter(
      (row): row is RecipeIngredientPortion => row.ingredient !== null && row.amountGrams > 0,
    );
  }, [watchedIngredients]);

  const liveNutritionSummary = useMemo(() => {
    return computeRecipeNutrition(validIngredientPortions, nutrientsById);
  }, [validIngredientPortions, nutrientsById]);

  const onFormSubmit = async (data: RecipeFormData): Promise<void> => {
    if (data.ingredients.length === 0) {
      toast.error('Please add at least one ingredient.');
      return;
    }

    const hasIncompleteRow = data.ingredients.some(
      (row) => !row.ingredient || row.amountGrams <= 0,
    );
    if (hasIncompleteRow) {
      toast.error('Please select an ingredient and enter a positive gram amount for all rows.');
      return;
    }

    const payload: CreateRecipePayload = {
      name: data.name.trim(),
      notes: data.notes.trim(),
      ingredients: data.ingredients
        .filter(
          (row): row is { ingredient: Ingredient; amountGrams: number } => row.ingredient !== null,
        )
        .map((row) => ({
          ingredient: row.ingredient.id,
          amountGrams: row.amountGrams,
        })),
    };

    await onSubmit(payload);
  };

  return (
    <Form
      noValidate
      onSubmit={(e) => {
        void handleSubmit(onFormSubmit)(e);
      }}
    >
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <h5 className="fw-semibold mb-3">Recipe Details</h5>
          <Row className="g-3">
            <Col xs={12} md={8}>
              <Form.Group controlId="recipeName">
                <Form.Label className="fw-medium">Recipe Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Oatmeal with Almonds, Avocado Toast"
                  disabled={isSubmitting}
                  isInvalid={Boolean(errors.name)}
                  {...register('name', { required: 'Please provide a recipe name.' })}
                />
                <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="recipeNotes">
                <Form.Label className="fw-medium">Notes & Instructions (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add notes, preparation steps, or serving suggestions..."
                  disabled={isSubmitting}
                  {...register('notes')}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-semibold mb-0">Ingredients Composition</h5>
            <small className="text-muted">
              Search 8,200+ whole foods and specify amounts in grams
            </small>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              append({ ingredient: null, amountGrams: 100 });
            }}
            disabled={isSubmitting}
          >
            <i className="bi bi-plus-lg me-1"></i> Add Ingredient
          </Button>
        </Card.Header>
        <Card.Body className="p-4">
          {fields.length === 0 ? (
            <div className="text-center py-4 text-muted border rounded bg-light">
              <i className="bi bi-basket d-block fs-3 mb-2"></i>
              No ingredients added yet. Click &quot;Add Ingredient&quot; to begin building your
              recipe.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {fields.map((field, index) => {
                const ingredientPath =
                  `ingredients.${String(index)}.ingredient` as const as `ingredients.${number}.ingredient`;
                const amountPath =
                  `ingredients.${String(index)}.amountGrams` as const as `ingredients.${number}.amountGrams`;

                return (
                  <Row key={field.id} className="g-2 align-items-center">
                    <Col xs={12} sm={7}>
                      <Controller
                        control={control}
                        name={ingredientPath}
                        render={({ field: selectField }) => (
                          <AsyncSelect<IngredientOption>
                            cacheOptions
                            defaultOptions
                            loadOptions={loadIngredientOptions}
                            value={
                              selectField.value
                                ? {
                                    value: selectField.value.id,
                                    label: selectField.value.name,
                                    ingredient: selectField.value,
                                  }
                                : null
                            }
                            placeholder="Type to search whole foods (e.g. oat, egg, salmon)..."
                            isDisabled={isSubmitting}
                            isClearable
                            onChange={(option) => {
                              selectField.onChange(option ? option.ingredient : null);
                            }}
                          />
                        )}
                      />
                    </Col>
                    <Col xs={9} sm={4}>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          min="1"
                          step="1"
                          placeholder="100"
                          disabled={isSubmitting}
                          {...register(amountPath, {
                            valueAsNumber: true,
                            min: 1,
                          })}
                        />
                        <InputGroup.Text>grams</InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col xs={3} sm={1} className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        title="Remove ingredient"
                        disabled={isSubmitting}
                        onClick={() => {
                          remove(index);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white py-3">
          <h5 className="fw-semibold mb-0">Live Nutrition Preview</h5>
          <small className="text-muted">Calculated automatically from ingredient portions</small>
        </Card.Header>
        <Card.Body className="p-4">
          <RecipeNutrientBreakdown
            calculatedNutrients={liveNutritionSummary.nutrients}
            totalWeightGrams={liveNutritionSummary.totalWeightGrams}
          />
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="outline-secondary"
          disabled={isSubmitting}
          onClick={() => {
            void navigate('/diet/recipes');
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Saving...</span>
            </>
          ) : (
            submitButtonLabel
          )}
        </Button>
      </div>
    </Form>
  );
};

export default RecipeForm;
