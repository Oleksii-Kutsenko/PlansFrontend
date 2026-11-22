import { type FC, type KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Container, Form, InputGroup, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import ConfirmModal from '@/components/ConfirmModal';
import {
  type Ingredient,
  type Nutrient,
  NUTRIENT_CATEGORIES,
  NUTRIENT_CATEGORY_KEYS,
  type NutrientCategory,
} from '@/features/diet/types/diet';

import {
  useDeleteIngredientMutation,
  useFetchIngredientsQuery,
  useFetchNutrientsQuery,
} from '../api/dietApi';

const PAGE_SIZE = 100;

type SortDirection = 'asc' | 'desc' | null;

interface NutrientSortState {
  nutrientId: number | null;
  direction: SortDirection;
}

export const ListIngredients: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<NutrientSortState>({
    nutrientId: null,
    direction: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null);

  // Debounce search input (350ms), resetting to page 1 on search change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Pressing Enter triggers immediate search without waiting for debounce
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }
  };

  const orderingParam = useMemo(() => {
    if (!sortState.nutrientId || !sortState.direction) return;
    return sortState.direction === 'desc'
      ? '-nutrient_values__amount_per_100g'
      : 'nutrient_values__amount_per_100g';
  }, [sortState]);

  const {
    data: ingredientsData,
    isLoading: isIngredientsLoading,
    isFetching: isIngredientsFetching,
    isError: isIngredientsError,
  } = useFetchIngredientsQuery({
    search: debouncedSearch,
    page,
    nutrientId: sortState.nutrientId,
    ordering: orderingParam,
  });

  const { data: nutrients = [] } = useFetchNutrientsQuery();
  const [deleteIngredient, { isLoading: isDeleting }] = useDeleteIngredientMutation();

  const ingredients = ingredientsData?.results ?? [];
  const totalCount = ingredientsData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const nutrientsByCategory = useMemo(() => {
    const groups = Object.fromEntries(
      NUTRIENT_CATEGORY_KEYS.map((category) => [category, [] as Nutrient[]]),
    ) as Record<NutrientCategory, Nutrient[]>;

    for (const nutrient of nutrients) {
      if (nutrient.category in groups) {
        groups[nutrient.category].push(nutrient);
      }
    }
    return groups;
  }, [nutrients]);

  const orderedNutrients = useMemo(() => {
    return NUTRIENT_CATEGORY_KEYS.flatMap((category) => nutrientsByCategory[category]);
  }, [nutrientsByCategory]);

  const sortedNutrient = useMemo(() => {
    if (!sortState.nutrientId) return null;
    return nutrients.find((nutrient) => nutrient.id === sortState.nutrientId) ?? null;
  }, [nutrients, sortState.nutrientId]);

  const handleNutrientHeaderClick = (nutrientId: number): void => {
    setPage(1);
    setSortState((prev) => {
      if (prev.nutrientId !== nutrientId) {
        return { nutrientId, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { nutrientId, direction: 'asc' };
      }
      return { nutrientId: null, direction: null };
    });
  };

  const handleClearSort = (): void => {
    setPage(1);
    setSortState({ nutrientId: null, direction: null });
  };

  const handleClearSearch = (): void => {
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteTarget) return;

    try {
      await deleteIngredient(deleteTarget.id).unwrap();
      toast.success(`Deleted "${deleteTarget.name}" successfully!`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete ingredient. Please try again.');
    }
  };

  if (isIngredientsLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading ingredients...</span>
        </Spinner>
      </Container>
    );
  }

  if (isIngredientsError || !ingredientsData) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger" role="alert">
          Failed to load ingredients. Please try again later.
        </div>
      </Container>
    );
  }

  const isSearchActive = Boolean(debouncedSearch);

  return (
    <Container fluid className="py-4 px-4">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Pantry Ingredients</h2>
          <small className="text-muted">
            All nutritional values per 100g &bull; {totalCount.toLocaleString()} total ingredients
          </small>
        </div>
        <div className="d-flex gap-2">
          <Link to="/diet/nutrients" className="btn btn-outline-secondary shadow-sm">
            <i className="bi bi-capsule me-1"></i> Nutrients Catalog
          </Link>
          <Link to="/diet/ingredients/create" className="btn btn-primary shadow-sm">
            <i className="bi bi-plus-lg me-1"></i> Add Ingredient
          </Link>
        </div>
      </div>

      {/* Main Table Card with Integrated Toolbar */}
      <Card className="shadow-sm border-0 overflow-hidden position-relative">
        <Card.Header className="bg-white py-2 px-3 border-bottom">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <InputGroup size="sm" style={{ width: '320px' }}>
                <InputGroup.Text className="bg-white border-end-0">
                  {isIngredientsFetching ? (
                    <Spinner
                      animation="border"
                      size="sm"
                      variant="primary"
                      style={{ width: '13px', height: '13px' }}
                    />
                  ) : (
                    <i className="bi bi-search text-muted"></i>
                  )}
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  size="sm"
                  className="border-start-0"
                  placeholder="Search 8,200+ whole foods..."
                  value={searchTerm}
                  onKeyDown={handleSearchKeyDown}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" size="sm" onClick={handleClearSearch}>
                    Clear
                  </Button>
                )}
              </InputGroup>

              {isSearchActive && (
                <span className="small text-secondary d-inline-flex align-items-center gap-1">
                  <i className="bi bi-filter text-primary"></i>
                  Found <strong>{totalCount.toLocaleString()}</strong> ingredients matching &ldquo;
                  <strong>{debouncedSearch}</strong>&rdquo;
                </span>
              )}

              {sortedNutrient && (
                <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 py-1 px-2 shadow-sm">
                  <i className="bi bi-sort-numeric-down text-primary"></i>
                  <span>
                    Sorted by <strong>{sortedNutrient.displayName}</strong> (
                    {sortState.direction === 'desc' ? 'Highest first' : 'Lowest first'})
                  </span>
                  <button
                    type="button"
                    className="btn-close ms-1"
                    style={{ fontSize: '8px' }}
                    aria-label="Clear sort"
                    onClick={handleClearSort}
                  />
                </span>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 small text-muted">
              <span>
                Showing {ingredients.length} of {totalCount.toLocaleString()}
              </span>
              {isIngredientsFetching && (
                <Spinner
                  animation="border"
                  size="sm"
                  variant="primary"
                  style={{ width: '12px', height: '12px' }}
                />
              )}
            </div>
          </div>
        </Card.Header>

        {/* Tactile overlay when network request is in-flight */}
        {isIngredientsFetching && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start pt-5"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(1px)',
              zIndex: 35,
            }}
          >
            <div className="bg-white px-4 py-2 rounded-pill shadow border d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" variant="primary" />
              <span className="small fw-semibold text-dark">
                {sortState.nutrientId ? 'Updating nutrient ranking...' : 'Updating results...'}
              </span>
            </div>
          </div>
        )}

        {/* Main Grid or Empty State */}
        {ingredients.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-basket3 fs-1 text-muted d-block mb-3"></i>
            <p className="text-muted mb-0">No ingredients match your criteria.</p>
            {(isSearchActive || sortedNutrient) && (
              <Button
                variant="outline-primary"
                size="sm"
                className="mt-3"
                onClick={() => {
                  handleClearSearch();
                  handleClearSort();
                }}
              >
                Reset All Filters
              </Button>
            )}
          </div>
        ) : (
          <div style={{ maxHeight: '72vh', overflow: 'auto' }}>
            <Table hover className="mb-0 align-middle table-sm border-bottom">
              <thead className="table-light sticky-top" style={{ zIndex: 10 }}>
                {/* Tier 1 Header: Category Groups */}
                <tr className="border-bottom text-center small">
                  <th
                    className="bg-white border-end shadow-sm text-start ps-3"
                    style={{ position: 'sticky', left: 0, zIndex: 20, minWidth: '380px' }}
                  >
                    Ingredient &bull; Actions
                  </th>
                  {NUTRIENT_CATEGORY_KEYS.map((category) => {
                    const count = nutrientsByCategory[category].length;
                    if (count === 0) return null;
                    const config = NUTRIENT_CATEGORIES[category];
                    return (
                      <th
                        key={category}
                        colSpan={count}
                        className="py-1 border-end text-uppercase fw-bold"
                        style={{ fontSize: '11px', letterSpacing: '0.5px' }}
                      >
                        <Badge bg={config.badge} className="me-1">
                          {config.label}
                        </Badge>
                      </th>
                    );
                  })}
                </tr>

                {/* Tier 2 Header: Individual Nutrient Columns */}
                <tr className="border-bottom small text-nowrap">
                  <th
                    className="bg-white border-end shadow-sm text-start ps-3 py-2 text-muted fw-semibold"
                    style={{ position: 'sticky', left: 0, zIndex: 20, minWidth: '380px' }}
                  >
                    Name
                  </th>
                  {orderedNutrients.map((nutrient) => {
                    const isSorted = sortState.nutrientId === nutrient.id;
                    const direction = isSorted ? sortState.direction : null;

                    return (
                      <th
                        key={nutrient.id}
                        className={`text-end px-2 py-2 user-select-none border-end ${
                          isSorted ? 'bg-primary-subtle text-primary fw-bold' : ''
                        }`}
                        style={{ minWidth: '85px', cursor: 'pointer' }}
                        title={`Click to sort by ${nutrient.displayName} (Highest first → Lowest first → Off)`}
                        onClick={() => {
                          handleNutrientHeaderClick(nutrient.id);
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <span className="text-truncate" style={{ maxWidth: '110px' }}>
                            {nutrient.displayName}
                          </span>
                          {direction === 'desc' && (
                            <i className="bi bi-sort-numeric-down-alt text-primary"></i>
                          )}
                          {direction === 'asc' && (
                            <i className="bi bi-sort-numeric-up text-primary"></i>
                          )}
                          {!direction && (
                            <i className="bi bi-arrow-down-up text-muted opacity-25"></i>
                          )}
                        </div>
                        <span className="text-muted fw-normal" style={{ fontSize: '10px' }}>
                          {nutrient.unit}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {ingredients.map((ingredient) => (
                  <tr key={ingredient.id}>
                    {/* Pinned Left Cell: Name + Immediate Actions */}
                    <td
                      className="bg-white border-end shadow-sm ps-3"
                      style={{ position: 'sticky', left: 0, zIndex: 5, minWidth: '380px' }}
                    >
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <span
                          className="fw-semibold text-dark text-truncate"
                          style={{ maxWidth: '300px' }}
                          title={ingredient.name}
                        >
                          {ingredient.name}
                        </span>
                        <div className="d-inline-flex gap-1 flex-shrink-0">
                          <Link
                            to={`/diet/ingredients/${String(ingredient.id)}/edit`}
                            className="btn btn-sm btn-outline-secondary p-1 py-0"
                            title="Edit ingredient"
                          >
                            <i className="bi bi-pencil" style={{ fontSize: '12px' }}></i>
                          </Link>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="p-1 py-0"
                            title="Delete ingredient"
                            onClick={() => {
                              setDeleteTarget(ingredient);
                            }}
                          >
                            <i className="bi bi-trash" style={{ fontSize: '12px' }}></i>
                          </Button>
                        </div>
                      </div>
                    </td>

                    {/* Nutrient Data Cells via nutrientMap */}
                    {orderedNutrients.map((nutrient) => {
                      const isSorted = sortState.nutrientId === nutrient.id;
                      const display = ingredient.nutrientMap?.[nutrient.id] ?? '—';

                      return (
                        <td
                          key={nutrient.id}
                          className={`text-end px-2 text-nowrap font-monospace border-end ${
                            isSorted ? 'bg-primary-subtle fw-bold' : ''
                          } ${display === '—' ? 'text-muted opacity-50' : ''}`}
                          style={{ fontSize: '12px' }}
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Pagination Footer */}
      <div className="d-flex justify-content-between align-items-center mt-3 px-1">
        <span className="text-muted small">
          Showing {ingredients.length} of {totalCount.toLocaleString()} ingredients &bull; Page{' '}
          {page} of {totalPages}
        </span>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={page <= 1 || isIngredientsFetching}
            onClick={() => {
              setPage((prev) => Math.max(1, prev - 1));
            }}
          >
            &larr; Previous
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={page >= totalPages || isIngredientsFetching}
            onClick={() => {
              setPage((prev) => prev + 1);
            }}
          >
            Next &rarr;
          </Button>
        </div>
      </div>

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete Ingredient"
        message={`Are you sure you want to delete "${deleteTarget?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteTarget(null);
        }}
      />
    </Container>
  );
};

export default ListIngredients;
