import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { Badge, Button, Form, InputGroup, Modal, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

import {
  useFetchTargetsQuery,
  useResetAllTargetsMutation,
  useResetTargetMutation,
  useUpdateTargetMutation,
} from '@/features/diet/api/dietApi';
import type { UserNutrientTarget } from '@/features/diet/types/diet';

interface TargetManagerModalProps {
  show: boolean;
  onClose: () => void;
}

const TargetManagerModal: FC<TargetManagerModalProps> = ({ show, onClose }) => {
  const { data: targets = [], isLoading } = useFetchTargetsQuery();
  const [updateTarget, { isLoading: isUpdating }] = useUpdateTargetMutation();
  const [resetTarget, { isLoading: isResettingOne }] = useResetTargetMutation();
  const [resetAllTargets, { isLoading: isResettingAll }] = useResetAllTargetsMutation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  const isBusy = isUpdating || isResettingOne || isResettingAll;

  const handleStartEdit = (target: UserNutrientTarget): void => {
    setEditingId(target.id);
    setEditValue(String(Number(target.weeklyTarget)));
  };

  const handleCancel = (): void => {
    setEditingId(null);
    setEditValue('');
  };

  const handleModalClose = (): void => {
    setConfirmResetAll(false);
    handleCancel();
    onClose();
  };

  const handleSave = async (target: UserNutrientTarget): Promise<void> => {
    const numeric = Number(editValue);
    if (numeric <= 0) {
      toast.warn('Please enter a target greater than 0.');
      return;
    }

    try {
      await updateTarget({
        id: target.id,
        data: {
          nutrient: target.nutrient,
          weeklyTarget: editValue,
        },
      }).unwrap();
      toast.success(`Updated ${target.nutrientDisplayName} target!`);
      handleCancel();
    } catch (error) {
      console.error('Failed to update target:', error);
      toast.error('Failed to update target. Please try again.');
    }
  };

  const handleResetSingle = async (target: UserNutrientTarget): Promise<void> => {
    try {
      await resetTarget(target.id).unwrap();
      if (editingId === target.id) {
        handleCancel();
      }
      toast.success(`Reset ${target.nutrientDisplayName} target to default.`);
    } catch (error) {
      console.error('Failed to reset target:', error);
      toast.error(`No default configured for ${target.nutrientDisplayName}.`);
    }
  };

  const handleResetAll = async (): Promise<void> => {
    try {
      await resetAllTargets().unwrap();
      setConfirmResetAll(false);
      handleCancel();
      toast.success('Reset all nutrient targets to defaults.');
    } catch (error) {
      console.error('Failed to reset all targets:', error);
      toast.error('Failed to reset targets. Please try again.');
    }
  };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" className="me-2" />
        <span className="text-muted small">Loading targets...</span>
      </div>
    );
  } else if (targets.length === 0) {
    content = (
      <div className="text-center py-4 text-muted small bg-light rounded border">
        No nutrient targets found.
      </div>
    );
  } else {
    content = (
      <div className="border rounded overflow-auto">
        <Table responsive hover className="align-middle mb-0 small">
          <thead className="table-light sticky-top">
            <tr>
              <th>Nutrient</th>
              <th>Category</th>
              <th>Weekly Target</th>
              <th>Daily Equivalent</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => {
              const isEditing = editingId === target.id;
              const numWeekly = Number(isEditing ? editValue : target.weeklyTarget);
              const dailyAvg = Math.round((numWeekly / 7) * 10) / 10;

              return (
                <tr key={target.id} className={isEditing ? 'table-primary' : ''}>
                  <td className="fw-semibold">{target.nutrientDisplayName}</td>
                  <td>
                    <Badge bg="light" text="dark" className="border text-capitalize">
                      {target.nutrientCategory}
                    </Badge>
                  </td>
                  <td>
                    {isEditing ? (
                      <InputGroup size="sm" className="w-auto">
                        <Form.Control
                          type="number"
                          step="any"
                          min="0.01"
                          disabled={isBusy}
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') void handleSave(target);
                            if (e.key === 'Escape') handleCancel();
                          }}
                        />
                        <InputGroup.Text>{target.nutrientUnit}</InputGroup.Text>
                      </InputGroup>
                    ) : (
                      <span>
                        <strong>{Number(target.weeklyTarget)}</strong> {target.nutrientUnit}
                      </span>
                    )}
                  </td>
                  <td className="text-muted">
                    ~{dailyAvg} {target.nutrientUnit}/day
                  </td>
                  <td className="text-end">
                    {isEditing ? (
                      <div className="d-flex justify-content-end gap-1">
                        <Button
                          variant="success"
                          size="sm"
                          className="py-0 px-2"
                          disabled={isBusy}
                          onClick={() => {
                            void handleSave(target);
                          }}
                          title="Save"
                        >
                          {isUpdating ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <i className="bi bi-check-lg"></i>
                          )}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="py-0 px-2"
                          disabled={isBusy}
                          onClick={handleCancel}
                          title="Cancel"
                        >
                          <i className="bi bi-x-lg"></i>
                        </Button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-end gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="py-0 px-2"
                          disabled={isBusy}
                          onClick={() => {
                            handleStartEdit(target);
                          }}
                        >
                          <i className="bi bi-pencil me-1"></i> Edit
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="py-0 px-2"
                          disabled={isBusy}
                          title="Reset to default"
                          onClick={() => {
                            void handleResetSingle(target);
                          }}
                        >
                          <i className="bi bi-arrow-counterclockwise"></i>
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  }

  return (
    <Modal show={show} onHide={handleModalClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5 d-flex align-items-center gap-2">
          <i className="bi bi-bullseye text-primary"></i>
          Manage Weekly Nutrient Targets
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">{content}</Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <div>
          {targets.length > 0 &&
            (confirmResetAll ? (
              <div className="d-flex align-items-center gap-2">
                <span className="small text-danger fw-medium">Reset all to defaults?</span>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => {
                    void handleResetAll();
                  }}
                >
                  Confirm
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => {
                    setConfirmResetAll(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline-danger"
                size="sm"
                disabled={isBusy}
                onClick={() => {
                  setConfirmResetAll(true);
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset All to Defaults
              </Button>
            ))}
        </div>
        <Button variant="secondary" disabled={isBusy} onClick={handleModalClose}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TargetManagerModal;
