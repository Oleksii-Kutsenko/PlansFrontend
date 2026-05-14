import { FC, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clothingActions } from '../../store/slices/clothing';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Row, Col, Badge } from 'react-bootstrap';
import OutfitFilters, { FilterState } from '../../components/clothing/OutfitFilters';
import ConfirmModal from '../../components/ConfirmModal';

const ListOutfit: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state
  const outfitItems = useSelector((state: RootState) => state.clothing.outfit);
  const occasions = useSelector((state: RootState) => state.clothing.occasions);
  const outfitOptions = useSelector(
    (state: RootState) =>
      state.clothing.outfitOptions as {
        season?: { value: string; displayName: string }[];
      } | null
  );

  // Local state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedOccasion: '',
    selectedSeason: ''
  });

  // Modal state
  const [outfitToDelete, setOutfitToDelete] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    // Fetch outfits, occasions, and options on mount
    void dispatch(clothingActions.fetchOutfits());
    void dispatch(clothingActions.fetchOccasions());
    void dispatch(clothingActions.fetchOutfitOptions());
  }, [dispatch]);

  // Client-side filtering logic
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

  const confirmDelete = () => {
    if (outfitToDelete) {
      dispatch(clothingActions.deleteOutfit(outfitToDelete.id))
        .unwrap()
        .then(() => {
          toast.success('Outfit deleted successfully');
          setOutfitToDelete(null);
        })
        .catch((error) => {
          console.error('Failed to delete outfit:', error);
          toast.error('Failed to delete outfit');
          setOutfitToDelete(null);
        });
    }
  };

  return (
    <div className='container mt-5 mb-5'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2>Outfits</h2>
        <div className='d-flex gap-2'>
          <Button variant='secondary' onClick={() => void navigate('/clothing/all')}>
            <i className='bi bi-grid me-2'></i>All Clothing
          </Button>
          <Button variant='success' onClick={() => void navigate('/clothing/create')}>
            Add Clothing
          </Button>
          <Button variant='primary' onClick={() => void navigate('/clothing/outfit/create')}>
            Create Outfit
          </Button>
        </div>
      </div>

      <OutfitFilters
        occasions={occasions}
        seasonChoices={outfitOptions?.season ?? []}
        onChange={setFilters}
      />

      {outfitItems.length === 0 ? (
        <div className='text-center py-5 bg-light rounded border'>
          <h4 className='text-muted mb-3'>No outfits found in your wardrobe.</h4>
          <Button variant='primary' onClick={() => void navigate('/clothing/outfit/create')}>
            Create Your First Outfit
          </Button>
        </div>
      ) : filteredOutfits.length === 0 ? (
        <div className='text-center py-5 bg-light rounded border'>
          <p className='text-muted mb-0 fs-5'>No outfits match your current filters.</p>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className='g-4'>
          {filteredOutfits.map((item) => (
            <Col key={item.id}>
              <Card className='h-100 shadow-sm transition-hover'>
                {/* Image Area */}
                <div
                  style={{
                    height: '250px',
                    backgroundColor: '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {item.previewImage ? (
                    <Card.Img
                      variant='top'
                      src={item.previewImage}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div className='text-muted text-center p-3 d-flex flex-column align-items-center'>
                      <i className='bi bi-images fs-1 mb-2'></i>
                      <span>No Preview</span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <Card.Body className='d-flex flex-column'>
                  <Card.Title className='fw-bold mb-3 text-truncate' title={item.outfitName}>
                    {item.outfitName}
                  </Card.Title>

                  <div className='d-flex flex-wrap gap-2 mb-3'>
                    {item.occasionName && (
                      <Badge bg='info' className='text-dark'>
                        <i className='bi bi-calendar-event me-1'></i> {item.occasionName}
                      </Badge>
                    )}
                    {item.season && (
                      <Badge bg='secondary'>
                        <i className='bi bi-cloud-sun me-1'></i> {item.season}
                      </Badge>
                    )}
                  </div>

                  <div className='mt-auto'>
                    <span className='text-muted small fw-medium'>
                      <i className='bi bi-collection me-1'></i>
                      {item.clothingCount ??
                        (Array.isArray(item.clothings) ? item.clothings.length : 0)}{' '}
                      items
                    </span>
                  </div>
                </Card.Body>

                {/* Actions Area */}
                <Card.Footer className='bg-white border-top-0 d-flex gap-2 pb-3'>
                  <Button
                    variant='outline-primary'
                    className='w-100'
                    size='sm'
                    onClick={() => void navigate(`/clothing/outfit/${item.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant='outline-danger'
                    size='sm'
                    title='Delete Outfit'
                    onClick={() => setOutfitToDelete({ id: item.id, name: item.outfitName })}
                  >
                    <i className='bi bi-trash'></i>
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        show={outfitToDelete !== null}
        title='Delete Outfit'
        message={`Are you sure you want to delete the outfit "${outfitToDelete?.name}"? This action cannot be undone.`}
        confirmLabel='Delete Outfit'
        onConfirm={confirmDelete}
        onCancel={() => setOutfitToDelete(null)}
      />
    </div>
  );
};

export default ListOutfit;
