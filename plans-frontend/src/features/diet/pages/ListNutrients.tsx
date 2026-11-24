import { type FC, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import ConfirmModal from '@/components/ConfirmModal';
import {
  type Nutrient,
  NUTRIENT_CATEGORIES,
  NUTRIENT_CATEGORY_KEYS,
  type NutrientCategory,
} from '@/features/diet/types/diet';

import { useDeleteNutrientMutation, useFetchNutrientsQuery } from '../api/dietApi';
import { NutrientModal } from '../components/NutrientModal';

const CATEGORY_FILTERS: { key: 'all' | NutrientCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  ...NUTRIENT_CATEGORY_KEYS.map((key) => ({
    key,
    label: NUTRIENT_CATEGORIES[key].label,
  })),
];

export const ListNutrients: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | NutrientCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNutrient, setEditingNutrient] = useState<Nutrient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Nutrient | null>(null);

  const { data: nutrients, isLoading, isError } = useFetchNutrientsQuery();
  const [deleteNutrient, { isLoading: isDeleting }] = useDeleteNutrientMutation();

  const filteredNutrients = useMemo(() => {
    if (!nutrients) return [];
    const term = searchTerm.trim().toLowerCase();

    return nutrients.filter((nutrient) => {
      const matchesCategory = categoryFilter === 'all' || nutrient.category === categoryFilter;
      const matchesSearch = !term || nutrient.name.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [nutrients, categoryFilter, searchTerm]);

  const handleOpenCreate = (): void => {
    setEditingNutrient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (nutrient: Nutrient): void => {
    setEditingNutrient(nutrient);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteTarget) return;

    try {
      await deleteNutrient(deleteTarget.id).unwrap();
      toast.success(`Nutrient "${deleteTarget.name}" deleted successfully!`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete nutrient. Please try again.');
    }
  };

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: nutrients?.length ?? 0 };
    if (nutrients) {
      for (const nutrient of nutrients) {
        counts[nutrient.category] = (counts[nutrient.category] ?? 0) + 1;
      }
    }
    return counts;
  }, [nutrients]);

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading nutrients catalog...</span>
        </Spinner>
      </Container>
    );
  }

  if (isError || !nutrients) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">
          Failed to load nutrients catalog. Please check your connection and try again.
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <title>Nutrients | Plans</title>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <Link
            to="/diet/ingredients"
            className="text-decoration-none text-secondary d-inline-flex align-items-center mb-1 small"
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Ingredients
          </Link>
          <h2 className="mb-0 fw-bold">Nutrients</h2>
          <small className="text-muted">
            Define and manage nutrients, units, and categories used across your ingredients
          </small>
        </div>
        <Button variant="primary" className="shadow-sm" onClick={handleOpenCreate}>
          <i className="bi bi-plus-lg me-1"></i> Add Nutrient
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col xs={12} md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search nutrients by name..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setSearchTerm('');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col xs={12} md={6} className="text-md-end">
              <ButtonGroup size="sm">
                {CATEGORY_FILTERS.map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={categoryFilter === key ? 'primary' : 'outline-secondary'}
                    onClick={() => {
                      setCategoryFilter(key);
                    }}
                  >
                    {label} ({countsByCategory[key] ?? 0})
                  </Button>
                ))}
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredNutrients.length === 0 ? (
        <Card className="text-center py-5 border-dashed">
          <Card.Body>
            <i className="bi bi-capsule fs-1 text-muted d-block mb-3"></i>
            {searchTerm ? (
              <p className="text-muted mb-0">No nutrients match &quot;{searchTerm}&quot;.</p>
            ) : (
              <>
                <p className="text-muted mb-3">No nutrients in this category yet.</p>
                <Button variant="outline-primary" onClick={handleOpenCreate}>
                  <i className="bi bi-plus-lg me-1"></i> Add First Nutrient
                </Button>
              </>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0 overflow-hidden">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Nutrient Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th className="text-end" style={{ width: '140px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredNutrients.map((nutrient) => (
                <tr key={nutrient.id}>
                  <td>
                    <span className="fw-semibold text-dark">{nutrient.name}</span>
                  </td>
                  <td>
                    <Badge bg={NUTRIENT_CATEGORIES[nutrient.category].badge} pill>
                      {NUTRIENT_CATEGORIES[nutrient.category].label}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="light" text="dark" className="border">
                      {nutrient.unit}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      title="Edit nutrient"
                      onClick={() => {
                        handleOpenEdit(nutrient);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Delete nutrient"
                      onClick={() => {
                        setDeleteTarget(nutrient);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <NutrientModal
        show={isModalOpen}
        nutrient={editingNutrient}
        onHide={() => {
          setIsModalOpen(false);
          setEditingNutrient(null);
        }}
      />

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete Nutrient"
        message={`Are you sure you want to delete "${deleteTarget?.name ?? ''}"? Ingredients referencing this nutrient may be affected.`}
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

export default ListNutrients;
