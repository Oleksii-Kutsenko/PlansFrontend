import type { FC } from 'react';
import { useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useCreatePlanMutation, useUpdatePlanMutation } from '@/features/diet/api/dietApi';
import type { Plan } from '@/features/diet/types/diet';

interface PlanFormValues {
  name: string;
  isDefault: boolean;
}

interface PlanFormModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (plan: Plan) => void;
  planToEdit?: Plan | null;
}

const PlanFormModal: FC<PlanFormModalProps> = ({ show, onClose, planToEdit, onSuccess }) => {
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();

  const isEditing = Boolean(planToEdit);
  const isSaving = isCreating || isUpdating;

  let submitButtonLabel = 'Create Plan';
  if (isSaving) {
    submitButtonLabel = 'Saving...';
  } else if (isEditing) {
    submitButtonLabel = 'Save Changes';
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    defaultValues: {
      name: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (planToEdit) {
      reset({
        name: planToEdit.name,
        isDefault: planToEdit.isDefault,
      });
    } else {
      reset({
        name: '',
        isDefault: false,
      });
    }
  }, [planToEdit, show, reset]);

  const onFormSubmit = async (data: PlanFormValues): Promise<void> => {
    const trimmedName = data.name.trim();

    try {
      if (isEditing && planToEdit) {
        const updated = await updatePlan({
          id: planToEdit.id,
          data: { name: trimmedName, isDefault: data.isDefault },
        }).unwrap();
        toast.success(`Updated plan "${updated.name}" successfully!`);
        onSuccess(updated);
      } else {
        const created = await createPlan({
          name: trimmedName,
          isDefault: data.isDefault,
        }).unwrap();
        toast.success(`Created plan "${created.name}" successfully!`);
        onSuccess(created);
      }
      onClose();
    } catch {
      toast.error('Failed to save meal plan. Please try again.');
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form
        noValidate
        onSubmit={(e) => {
          void handleSubmit(onFormSubmit)(e);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="h5">
            {isEditing ? 'Rename Meal Plan' : 'Create New Meal Plan'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3" controlId="planName">
            <Form.Label className="fw-semibold">Plan Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Bulking Phase 1, Summer Cut, Maintenance"
              disabled={isSaving}
              isInvalid={Boolean(errors.name)}
              {...register('name', { required: 'Please enter a plan name.' })}
            />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="isDefaultCheckbox">
            <Form.Check
              type="checkbox"
              label="Set as default weekly plan"
              disabled={isSaving}
              {...register('isDefault')}
            />
            <Form.Text className="text-muted">
              The default plan loads automatically when opening the Meal Planner.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
            {submitButtonLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PlanFormModal;
