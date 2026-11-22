import type { FC } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  type Nutrient,
  NUTRIENT_CATEGORIES,
  NUTRIENT_CATEGORY_KEYS,
  NUTRIENT_UNITS,
  type NutrientCategory,
  type NutrientUnit,
} from '@/features/diet/types/diet';

import { useCreateNutrientMutation, useUpdateNutrientMutation } from '../api/dietApi';

interface NutrientModalProps {
  show: boolean;
  nutrient: Nutrient | null;
  onHide: () => void;
}

interface NutrientFormValues {
  name: string;
  displayName: string;
  unit: NutrientUnit;
  category: NutrientCategory;
}

const DEFAULT_FORM_VALUES: NutrientFormValues = {
  name: '',
  displayName: '',
  unit: 'g',
  category: 'macro',
};

export const NutrientModal: FC<NutrientModalProps> = ({ show, nutrient, onHide }) => {
  const [createNutrient, { isLoading: isCreating }] = useCreateNutrientMutation();
  const [updateNutrient, { isLoading: isUpdating }] = useUpdateNutrientMutation();

  const isSubmitting = isCreating || isUpdating;
  const isEditing = Boolean(nutrient);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NutrientFormValues>({
    values: nutrient ?? DEFAULT_FORM_VALUES,
  });

  const onSubmit = async (data: NutrientFormValues): Promise<void> => {
    const trimmedName = data.name.trim();
    const trimmedDisplayName = data.displayName.trim() || trimmedName;

    try {
      if (isEditing && nutrient) {
        await updateNutrient({
          id: nutrient.id,
          data: {
            name: trimmedName,
            displayName: trimmedDisplayName,
            unit: data.unit,
            category: data.category,
          },
        }).unwrap();
        toast.success(`Updated nutrient "${trimmedDisplayName}" successfully!`);
      } else {
        await createNutrient({
          name: trimmedName,
          displayName: trimmedDisplayName,
          unit: data.unit,
          category: data.category,
        }).unwrap();
        toast.success(`Created nutrient "${trimmedDisplayName}" successfully!`);
      }
      onHide();
    } catch {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} nutrient. Please try again.`);
    }
  };

  let submitButtonText = 'Create Nutrient';
  if (isSubmitting) {
    submitButtonText = 'Saving...';
  } else if (isEditing) {
    submitButtonText = 'Save Changes';
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Nutrient' : 'Add New Nutrient'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          <Form.Group controlId="nutrientName">
            <Form.Label className="fw-medium">Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Fatty acids, total saturated"
              disabled={isSubmitting}
              isInvalid={Boolean(errors.name)}
              {...register('name', { required: 'Please enter a nutrient name.' })}
            />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="nutrientDisplayName">
            <Form.Label className="fw-medium">Display Name (Short)</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Sat. Fat"
              disabled={isSubmitting}
              {...register('displayName')}
            />
            <Form.Text className="text-muted small">
              Used in table column headers and compact badges.
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="nutrientCategory">
            <Form.Label className="fw-medium">Category</Form.Label>
            <Form.Select disabled={isSubmitting} {...register('category')}>
              {NUTRIENT_CATEGORY_KEYS.map((category) => (
                <option key={category} value={category}>
                  {NUTRIENT_CATEGORIES[category].label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="nutrientUnit">
            <Form.Label className="fw-medium">Unit of Measurement</Form.Label>
            <Form.Select disabled={isSubmitting} {...register('unit')}>
              {NUTRIENT_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" disabled={isSubmitting} onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
            )}
            {submitButtonText}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default NutrientModal;
