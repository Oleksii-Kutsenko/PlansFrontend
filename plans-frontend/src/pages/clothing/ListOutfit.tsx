import { FC, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  useDeleteOutfitMutation,
  useFetchOccasionsQuery,
  useFetchOutfitOptionsQuery,
  useFetchOutfitsQuery,
} from '@/store/api/clothingApi';

import OutfitFilters, { FilterState } from '../../components/clothing/OutfitFilters';
import ConfirmModal from '../../components/ConfirmModal';

const ListOutfit: FC = () => {
  const navigate = useNavigate();

  const { data: outfitItems = [], isLoading, isError } = useFetchOutfitsQuery();
  const { data: occasions = [] } = useFetchOccasionsQuery();
  const { data: outfitOptions } = useFetchOutfitOptionsQuery();
  const [deleteOutfit] = useDeleteOutfitMutation();

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedOccasion: '',
    selectedSeason: '',
  });

  const [outfitToDelete, setOutfitToDelete] = useState<{ id: number; name: string } | null>(null);

  const filteredOutfits = useMemo(() => {
    return outfitItems.filter((item) => {
      const matchesSearch = item.outfitName
        ? item.outfitName.toLowerCase().includes(filters.searchQuery.toLowerCase())
        : false;
      const matchesOccasion = filters.selectedOccasion
        ? String(item.occasion) === filters.selectedOccasion
        : true;
      const matchesSeason = filters.selectedSeason ? item.season === filters.selectedSeason : true;
      return matchesSearch && matchesOccasion && matchesSeason;
    });
  }, [outfitItems, filters]);

  const confirmDelete = async (): Promise<void> => {
    if (!outfitToDelete) return;
    try {
      await deleteOutfit(outfitToDelete.id).unwrap();
      toast.success('Outfit deleted successfully');
    } catch {
      toast.error('Failed to delete outfit');
    }
    setOutfitToDelete(null);
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading your wardrobe...</p>
      </div>
    );
  } else if (isError) {
    content = (
      <div className="text-center py-5 bg-light rounded border border-danger">
        <p className="text-danger mb-0 fs-5">Failed to load outfits. Please try again later.</p>
      </div>
    );
  } else if (outfitItems.length === 0) {
    content = (
      <div className="text-center py-5 bg-light rounded border">
        <h4 className="text-muted mb-3">No outfits found in your wardrobe.</h4>
        <Button variant="primary" onClick={() => void navigate('/clothing/outfit/create')}>
          Create Your First Outfit
        </Button>
      </div>
    );
  } else if (filteredOutfits.length === 0) {
    content = (
      <div className="text-center py-5 bg-light rounded border">
        <p className="text-muted mb-0 fs-5">No outfits match your current filters.</p>
      </div>
    );
  } else {
    content = (
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {filteredOutfits.map((outfit) => (
          <Col key={outfit.id}>
            <Card className="h-100 shadow-sm transition-hover">
              {/* Image Area */}
              <div
                style={{
                  height: '250px',
                  backgroundColor: '#e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {outfit.previewImage ? (
                  <Card.Img
                    variant="top"
                    src={outfit.previewImage}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="text-muted text-center p-3 d-flex flex-column align-items-center">
                    <i className="bi bi-images fs-1 mb-2"></i>
                    <span>No Preview</span>
                  </div>
                )}
              </div>
              {/* Content Area */}
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fw-bold mb-3 text-truncate" title={outfit.outfitName}>
                  {outfit.outfitName}
                </Card.Title>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {outfit.occasionName && (
                    <Badge bg="info" className="text-dark">
                      <i className="bi bi-calendar-event me-1"></i> {outfit.occasionName}
                    </Badge>
                  )}
                  {outfit.season && (
                    <Badge bg="secondary">
                      <i className="bi bi-cloud-sun me-1"></i> {outfit.season}
                    </Badge>
                  )}
                </div>
                <div className="mt-auto">
                  <span className="text-muted small fw-medium">
                    <i className="bi bi-collection me-1"></i>
                    {outfit.clothingCount ??
                      (Array.isArray(outfit.clothings) ? outfit.clothings.length : 0)}{' '}
                    items
                  </span>
                </div>
              </Card.Body>
              {/* Actions Area */}
              <Card.Footer className="bg-white border-top-0 d-flex gap-2 pb-3">
                <Button
                  variant="outline-primary"
                  className="w-100"
                  size="sm"
                  onClick={() => void navigate(`/clothing/outfit/${String(outfit.id)}`)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  title="Delete Outfit"
                  onClick={() => {
                    setOutfitToDelete({ id: outfit.id, name: outfit.outfitName });
                  }}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Outfits</h2>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={() => void navigate('/clothing/clothing')}>
            <i className="bi bi-grid me-2"></i>All Clothing
          </Button>
          <Button variant="success" onClick={() => void navigate('/clothing/create')}>
            Add Clothing
          </Button>
          <Button variant="primary" onClick={() => void navigate('/clothing/outfit/create')}>
            Create Outfit
          </Button>
        </div>
      </div>
      <OutfitFilters
        occasions={occasions}
        seasonChoices={outfitOptions?.season ?? []}
        onChange={setFilters}
      />
      {content}
      <ConfirmModal
        show={outfitToDelete !== null}
        title="Delete Outfit"
        message={`Are you sure you want to delete the outfit "${String(outfitToDelete?.name)}"? This action cannot be undone.`}
        confirmLabel="Delete Outfit"
        onConfirm={confirmDelete}
        onCancel={() => {
          setOutfitToDelete(null);
        }}
      />
    </div>
  );
};
export default ListOutfit;
