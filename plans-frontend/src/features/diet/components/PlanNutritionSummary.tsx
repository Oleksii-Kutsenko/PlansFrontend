import type { FC } from 'react';
import { useMemo } from 'react';
import { Badge, Card, ProgressBar, Spinner } from 'react-bootstrap';

import { useFetchPlanSummaryQuery } from '@/features/diet/api/dietApi';
import {
  NUTRIENT_CATEGORY_KEYS,
  type NutrientCategory,
  type PlanSummaryItem,
} from '@/features/diet/types/diet';

interface PlanNutritionSummaryProps {
  planId: number;
}

interface NutrientStatus {
  isCritical: boolean;
  variant: 'danger' | 'warning' | 'success';
  percentColor: string;
  score: number;
}

const getNutrientStatus = (item: PlanSummaryItem): NutrientStatus => {
  const score = Math.round(item.accuracyScore);

  if (score < 50) {
    return {
      isCritical: true,
      variant: 'danger',
      percentColor: 'text-danger',
      score,
    };
  }

  if (score < 100) {
    return {
      isCritical: false,
      variant: 'warning',
      percentColor: 'text-warning-emphasis',
      score,
    };
  }

  return {
    isCritical: false,
    variant: 'success',
    percentColor: 'text-success',
    score,
  };
};

const PlanNutritionSummary: FC<PlanNutritionSummaryProps> = ({ planId }) => {
  const { data: summary, isLoading, isError } = useFetchPlanSummaryQuery(planId);

  const groupedCategories = useMemo(() => {
    if (!summary?.items) return [];

    const groups = Object.fromEntries(
      NUTRIENT_CATEGORY_KEYS.map((cat) => [cat, [] as PlanSummaryItem[]]),
    ) as Record<NutrientCategory, PlanSummaryItem[]>;

    for (const item of summary.items) {
      if (item.category in groups) {
        groups[item.category].push(item);
      }
    }

    const categories: [NutrientCategory, PlanSummaryItem[]][] = [];
    for (const cat of NUTRIENT_CATEGORY_KEYS) {
      const items = groups[cat];
      if (items.length > 0) {
        items.sort((a, b) => a.accuracyScore - b.accuracyScore);
        categories.push([cat, items]);
      }
    }

    return categories;
  }, [summary]);

  if (isLoading) {
    return (
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body text-center py-3">
          <Spinner animation="border" size="sm" className="me-2" />
          <span className="text-muted small">Loading nutrition summary...</span>
        </div>
      </div>
    );
  }

  if (isError || !summary || summary.items.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm border-0 mb-3">
      <Card.Body className="p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <h6 className="fw-bold mb-0">Weekly Nutrition & Targets</h6>
          <Badge bg="primary">Reassurance Score: {Math.round(summary.reassuranceScore)}%</Badge>
        </div>

        <div className="row g-2">
          {groupedCategories.map(([category, items]) => (
            <div key={category} className="col-12 col-md-6 col-xl-3">
              <div className="p-2 border rounded bg-light h-100">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
                  <span className="fw-bold small text-capitalize text-secondary">{category}</span>
                  <span className="badge bg-secondary-subtle text-secondary small">
                    {items.length}
                  </span>
                </div>

                <div className="d-flex flex-column gap-2">
                  {items.map((item) => {
                    const { isCritical, variant, percentColor, score } = getNutrientStatus(item);

                    return (
                      <div key={item.nutrientId}>
                        <div className="d-flex justify-content-between align-items-baseline small mb-1">
                          <span
                            className={`text-truncate me-1 ${isCritical ? 'fw-bold text-danger' : 'fw-medium'}`}
                            title={item.name}
                          >
                            {item.displayName}
                          </span>
                          <span className="small text-nowrap">
                            <span className="text-muted">
                              {item.actualAmount.toFixed(1)} / {item.targetAmount.toFixed(1)}{' '}
                              {item.unit}
                            </span>{' '}
                            <span className={`fw-bold ${percentColor}`}>({score}%)</span>
                          </span>
                        </div>

                        <ProgressBar now={score} variant={variant} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PlanNutritionSummary;
