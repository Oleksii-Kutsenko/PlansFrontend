import {
  type CSSProperties,
  type FC,
  type ReactElement,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Badge, Card, ProgressBar, Spinner } from 'react-bootstrap';

import { useFetchPlanSummaryQuery } from '@/features/diet/api/dietApi';
import FocusedNutrientPanel from '@/features/diet/components/FocusedNutrientPanel';
import { NUTRIENT_CATEGORY_KEYS, type PlanSummaryItem } from '@/features/diet/types/diet';

interface PlanNutritionSummaryProps {
  planId: number;
  selectedNutrientId: number | null;
  onSelectNutrient: (nutrientId: number) => void;
}

interface NutrientStatus {
  isCritical: boolean;
  color: string;
  score: number;
  rowClass: string;
}

type GroupedCategory = readonly [PlanSummaryItem['category'], PlanSummaryItem[]];

const DEFAULT_FOCUSED_HEIGHT_PX = 620;

const getNutrientStatus = (summaryItem: PlanSummaryItem, isSelected: boolean): NutrientStatus => {
  const score = Math.round(summaryItem.accuracyScore);
  // Cap hue at 100% so color stays green (120deg) when target is exceeded
  const hue = Math.min(score, 100) * 1.2;

  return {
    isCritical: score < 50,
    color: `hsl(${String(Math.round(hue))}, 75%, 40%)`,
    score,
    rowClass: isSelected ? 'bg-primary-subtle border-primary' : 'bg-transparent border-light',
  };
};

const measureColumnHeight = (gridContainer: HTMLDivElement | null): number | null => {
  const firstColumn = gridContainer?.firstElementChild;
  if (!firstColumn) return null;

  const measuredHeight = Math.round(firstColumn.getBoundingClientRect().height);
  return measuredHeight > 0 ? measuredHeight : null;
};

const scrollNutrientIntoView = (listContainer: HTMLDivElement | null, nutrientId: number): void => {
  if (!listContainer) return;

  const activeButton = listContainer.querySelector<HTMLElement>(
    `[data-nutrient-id="${String(nutrientId)}"]`,
  );
  if (!activeButton) return;

  const containerRect = listContainer.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  const isOutsideView =
    buttonRect.top < containerRect.top || buttonRect.bottom > containerRect.bottom;

  if (isOutsideView) {
    const offsetInsideList = buttonRect.top - containerRect.top + listContainer.scrollTop;
    listContainer.scrollTop = Math.max(
      0,
      offsetInsideList - listContainer.clientHeight / 2 + activeButton.offsetHeight / 2,
    );
  }
};

const renderNutrientButton = (
  summaryItem: PlanSummaryItem,
  isSelected: boolean,
  onSelectNutrient: (nutrientId: number) => void,
): ReactElement => {
  const { isCritical, color, score, rowClass } = getNutrientStatus(summaryItem, isSelected);

  return (
    <button
      key={summaryItem.nutrientId}
      type="button"
      data-nutrient-id={summaryItem.nutrientId}
      className={`w-100 text-start border px-2 py-1 rounded ${rowClass}`}
      onClick={() => {
        onSelectNutrient(summaryItem.nutrientId);
      }}
    >
      <div className="d-flex justify-content-between align-items-baseline small mb-1">
        <span
          className={`text-truncate me-1 ${isCritical ? 'fw-bold text-danger' : 'fw-medium'}`}
          title={summaryItem.name}
        >
          {summaryItem.displayName}
        </span>
        <span className="small text-nowrap">
          <span className="text-muted">
            {summaryItem.actualAmount.toFixed(1)} / {summaryItem.targetAmount.toFixed(1)}{' '}
            {summaryItem.unit}
          </span>{' '}
          <span className="fw-bold" style={{ color }}>
            ({score}%)
          </span>
        </span>
      </div>

      <ProgressBar
        now={score}
        style={
          {
            '--bs-progress-bar-bg': color,
            height: '6px',
          } as CSSProperties
        }
      />
    </button>
  );
};

const renderCategorySection = (
  category: PlanSummaryItem['category'],
  categoryItems: PlanSummaryItem[],
  selectedNutrientId: number | null,
  onSelectNutrient: (nutrientId: number) => void,
): ReactElement => (
  <>
    <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
      <span className="fw-bold small text-capitalize text-secondary">{category}</span>
      <span className="badge bg-secondary-subtle text-secondary small">{categoryItems.length}</span>
    </div>

    <div className="d-flex flex-column gap-1">
      {categoryItems.map((summaryItem) =>
        renderNutrientButton(
          summaryItem,
          summaryItem.nutrientId === selectedNutrientId,
          onSelectNutrient,
        ),
      )}
    </div>
  </>
);

const PlanNutritionSummary: FC<PlanNutritionSummaryProps> = ({
  planId,
  selectedNutrientId,
  onSelectNutrient,
}) => {
  const [focusedHeightPx, setFocusedHeightPx] = useState<number>(DEFAULT_FOCUSED_HEIGHT_PX);
  const overviewGridRef = useRef<HTMLDivElement | null>(null);
  const focusedListRef = useRef<HTMLDivElement | null>(null);
  const shouldRevealSelectedRef = useRef(false);

  const { data: summary, isLoading, isError } = useFetchPlanSummaryQuery(planId);

  const groupedCategories = useMemo<GroupedCategory[]>(() => {
    if (!summary?.items) return [];

    return NUTRIENT_CATEGORY_KEYS.flatMap((category) => {
      const categoryItems = summary.items
        .filter((summaryItem) => summaryItem.category === category)
        .toSorted((firstItem, secondItem) => firstItem.accuracyScore - secondItem.accuracyScore);

      return categoryItems.length > 0 ? [[category, categoryItems] as const] : [];
    });
  }, [summary]);

  const selectedNutrient = useMemo(() => {
    if (!summary || selectedNutrientId === null) return null;
    return (
      summary.items.find((summaryItem) => summaryItem.nutrientId === selectedNutrientId) ?? null
    );
  }, [summary, selectedNutrientId]);

  useLayoutEffect(() => {
    if (!shouldRevealSelectedRef.current || selectedNutrientId === null) {
      return;
    }
    shouldRevealSelectedRef.current = false;
    scrollNutrientIntoView(focusedListRef.current, selectedNutrientId);
  }, [selectedNutrientId]);

  const handleOverviewSelect = (nutrientId: number): void => {
    const measuredHeight = measureColumnHeight(overviewGridRef.current);
    if (measuredHeight !== null) {
      setFocusedHeightPx(measuredHeight);
    }
    shouldRevealSelectedRef.current = true;
    onSelectNutrient(nutrientId);
  };

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

        {selectedNutrient ? (
          <div className="row g-2">
            <div className="col-12 col-lg-4 col-xl-3">
              <div
                ref={focusedListRef}
                className="p-2 border rounded bg-light overflow-auto d-flex flex-column gap-3"
                style={{ height: `${String(focusedHeightPx)}px` }}
              >
                {groupedCategories.map(([category, categoryItems]) => (
                  <div key={category}>
                    {renderCategorySection(
                      category,
                      categoryItems,
                      selectedNutrient.nutrientId,
                      onSelectNutrient,
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-lg-8 col-xl-9">
              <div style={{ height: `${String(focusedHeightPx)}px` }}>
                <FocusedNutrientPanel
                  nutrient={selectedNutrient}
                  onClose={() => {
                    onSelectNutrient(selectedNutrient.nutrientId);
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div ref={overviewGridRef} className="row g-2">
            {groupedCategories.map(([category, categoryItems]) => (
              <div key={category} className="col-12 col-md-6 col-xl-3">
                <div className="p-2 border rounded bg-light h-100">
                  {renderCategorySection(category, categoryItems, null, handleOverviewSelect)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PlanNutritionSummary;
