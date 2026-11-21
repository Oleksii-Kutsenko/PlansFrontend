import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Badge, Button, Container, Dropdown, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import ConfirmModal from '@/components/ConfirmModal';
import {
  useDeletePlanMutation,
  useFetchPlansQuery,
  useUpdatePlanMutation,
} from '@/features/diet/api/dietApi';
import AddMealModal from '@/features/diet/components/AddMealModal';
import DayColumn from '@/features/diet/components/DayColumn';
import PlanFormModal from '@/features/diet/components/PlanFormModal';
import PlanNutritionSummary from '@/features/diet/components/PlanNutritionSummary';
import TargetManagerModal from '@/features/diet/components/TargetManagerModal';
import type { Plan, PlanDay } from '@/features/diet/types/diet';

const MealPlanner: FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletePlanTarget, setDeletePlanTarget] = useState<Plan | null>(null);
  const [showTargetsModal, setShowTargetsModal] = useState(false);

  const [activePlanDay, setActivePlanDay] = useState<PlanDay | null>(null);

  const { data: allPlans = [], isLoading: isPlansLoading } = useFetchPlansQuery();

  const [updatePlan] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: isDeletingPlan }] = useDeletePlanMutation();

  // Resolve currently active plan
  const activePlan = useMemo(() => {
    if (allPlans.length === 0) return null;

    if (id) {
      const match = allPlans.find((p) => p.id === Number(id));
      if (match) return match;
    }

    // Default plan fallback
    const defaultMatch = allPlans.find((p) => p.isDefault);
    return defaultMatch ?? allPlans[0];
  }, [allPlans, id]);

  const handleSelectPlan = (selectedId: number): void => {
    void navigate(`/diet/plans/${String(selectedId)}`);
  };

  const handleSetDefault = async (plan: Plan): Promise<void> => {
    try {
      await updatePlan({ id: plan.id, data: { isDefault: true } }).unwrap();
      toast.success(`"${plan.name}" is now your default meal plan.`);
    } catch {
      toast.error('Failed to set default plan.');
    }
  };

  const handleDeletePlanConfirm = async (): Promise<void> => {
    if (!deletePlanTarget) return;
    try {
      await deletePlan(deletePlanTarget.id).unwrap();
      toast.success(`Deleted plan "${deletePlanTarget.name}".`);
      setDeletePlanTarget(null);
      void navigate('/diet/plans');
    } catch {
      toast.error('Failed to delete plan.');
    }
  };

  if (isPlansLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading meal plans...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4">
      {/* Top Header & Plan Switcher Toolbar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div className="d-flex align-items-center gap-3">
          <div>
            <h2 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-calendar-week text-primary"></i>
              Weekly Meal Planner
            </h2>
            <small className="text-muted">
              Organize your weekly meals and track daily nutrition
            </small>
          </div>

          {activePlan && (
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-2 shadow-sm"
              >
                <span className="fw-semibold">{activePlan.name}</span>
                {activePlan.isDefault && (
                  <Badge bg="success" style={{ fontSize: '10px' }}>
                    Default
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-sm">
                <Dropdown.Header>Switch Plan</Dropdown.Header>
                {allPlans.map((plan) => (
                  <Dropdown.Item
                    key={plan.id}
                    active={plan.id === activePlan.id}
                    onClick={() => {
                      handleSelectPlan(plan.id);
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center gap-3">
                      <span>{plan.name}</span>
                      {plan.isDefault && (
                        <Badge bg="success" style={{ fontSize: '9px' }}>
                          Default
                        </Badge>
                      )}
                    </div>
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={() => {
                    setEditingPlan(null);
                    setShowPlanModal(true);
                  }}
                >
                  <i className="bi bi-plus-lg me-1 text-primary"></i> Create New Plan
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {/* Right Actions */}
        <div className="d-flex align-items-center gap-2">
          {activePlan && (
            <>
              {!activePlan.isDefault && (
                <Button
                  variant="outline-success"
                  size="sm"
                  className="shadow-sm"
                  onClick={() => {
                    void handleSetDefault(activePlan);
                  }}
                >
                  <i className="bi bi-star me-1"></i> Set as Default
                </Button>
              )}
              <Button
                variant="outline-secondary"
                size="sm"
                className="shadow-sm"
                onClick={() => {
                  setEditingPlan(activePlan);
                  setShowPlanModal(true);
                }}
              >
                <i className="bi bi-pencil me-1"></i> Rename
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="shadow-sm"
                onClick={() => {
                  setDeletePlanTarget(activePlan);
                }}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </>
          )}

          <Button
            variant="outline-primary"
            size="sm"
            className="shadow-sm"
            onClick={() => {
              setShowTargetsModal(true);
            }}
          >
            <i className="bi bi-bullseye me-1"></i> Targets
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="shadow-sm"
            onClick={() => {
              setEditingPlan(null);
              setShowPlanModal(true);
            }}
          >
            <i className="bi bi-plus-lg me-1"></i> New Plan
          </Button>
        </div>
      </div>

      {/* Main Board Container */}
      {activePlan ? (
        <>
          <div className="row flex-nowrap overflow-auto g-2 pb-3">
            {activePlan.days.map((planDay) => (
              <div key={planDay.id} className="col-10 col-sm-6 col-md-4 col-lg flex-lg-fill d-flex">
                <DayColumn planDay={planDay} onAddMeal={setActivePlanDay} />
              </div>
            ))}
          </div>
          <PlanNutritionSummary planId={activePlan.id} />
        </>
      ) : (
        <div className="card text-center py-5 border-dashed">
          <div className="card-body">
            <i className="bi bi-calendar-plus fs-1 text-muted d-block mb-3"></i>
            <h5 className="fw-bold">No Meal Plans Found</h5>
            <p className="text-muted mb-3">
              Create your first weekly meal plan to start scheduling your recipes across the week.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingPlan(null);
                setShowPlanModal(true);
              }}
            >
              <i className="bi bi-plus-lg me-1"></i> Create First Plan
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PlanFormModal
        show={showPlanModal}
        planToEdit={editingPlan}
        onClose={() => {
          setShowPlanModal(false);
          setEditingPlan(null);
        }}
        onSuccess={(savedPlan) => {
          void navigate(`/diet/plans/${String(savedPlan.id)}`);
        }}
      />

      {activePlanDay && (
        <AddMealModal
          planDay={activePlanDay}
          onClose={() => {
            setActivePlanDay(null);
          }}
        />
      )}

      <ConfirmModal
        show={Boolean(deletePlanTarget)}
        title="Delete Meal Plan"
        message={`Are you sure you want to delete "${deletePlanTarget?.name ?? ''}"? All scheduled days and meals will be permanently removed.`}
        confirmLabel={isDeletingPlan ? 'Deleting...' : 'Delete Plan'}
        variant="danger"
        onConfirm={handleDeletePlanConfirm}
        onCancel={() => {
          setDeletePlanTarget(null);
        }}
      />

      <TargetManagerModal
        show={showTargetsModal}
        onClose={() => {
          setShowTargetsModal(false);
        }}
      />
    </Container>
  );
};

export default MealPlanner;
