import { FC, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clothingActions } from '../../store/slices/clothing';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Row, Col } from 'react-bootstrap';
import ClothingFilters, { ClothingFilterState } from '../../components/clothing/ClothingFilters';
import ConfirmModal from '../../components/ConfirmModal';
import ClothingCard from '../../components/clothing/ClothingCard';

const ClothingList: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state
  const clothingItems = useSelector((state: RootState) => state.clothing.clothing);
  const clothingOptions = useSelector(
    (state: RootState) =>
      state.clothing.options as {
        clothingType?: { value: string; displayName: string }[];
      } | null
  );

  // Local state
  const [filters, setFilters] = useState<ClothingFilterState>({
    searchQuery: '',
    selectedType: ''
  });

  // Modal state
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    // Fetch clothing and options on mount
    void dispatch(clothingActions.fetchClothing());
    void dispatch(clothingActions.fetchClothingOptions());
  }, [dispatch]);

  // Client-side filtering logic
  const filteredClothing = useMemo(() => {
    return clothingItems.filter((item) => {
      const matchesSearch = item.name
        ? item.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
        : false;
      const matchesType = filters.selectedType ? item.clothingType === filters.selectedType : true;

      return matchesSearch && matchesType;
    });
  }, [clothingItems, filters]);

  const confirmDelete = () => {
    if (itemToDelete) {
      dispatch(clothingActions.deleteClothing(itemToDelete.id))
        .unwrap()
        .then(() => {
          toast.success('Clothing deleted successfully');
          setItemToDelete(null);
        })
        .catch((error) => {
          console.error('Failed to delete clothing:', error);
          toast.error('Failed to delete clothing');
          setItemToDelete(null);
        });
    }
  };

  return (
    <div className='container mt-5 mb-5'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2>All Clothing Items</h2>
        <div className='d-flex gap-2'>
          <Button variant='outline-secondary' onClick={() => void navigate('/clothing')}>
            <i className='bi bi-arrow-left me-2'></i>Back to Outfits
          </Button>
          <Button variant='success' onClick={() => void navigate('/clothing/create')}>
            Add New Item
          </Button>
        </div>
      </div>

      <ClothingFilters typeOptions={clothingOptions?.clothingType ?? []} onChange={setFilters} />

      {clothingItems.length === 0 ? (
        <div className='text-center py-5 bg-light rounded border'>
          <h4 className='text-muted mb-3'>Your wardrobe is completely empty.</h4>
          <Button variant='success' onClick={() => void navigate('/clothing/create')}>
            Add Your First Item
          </Button>
        </div>
      ) : filteredClothing.length === 0 ? (
        <div className='text-center py-5 bg-light rounded border'>
          <p className='text-muted mb-0 fs-5'>No clothing items match your current filters.</p>
        </div>
      ) : (
        <Row xs={2} sm={3} md={4} lg={5} className='g-4'>
          {filteredClothing.map((item) => (
            <Col key={item.id}>
              <ClothingCard
                item={item}
                removable={true}
                onRemove={() => setItemToDelete({ id: item.id, name: item.name })}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        show={itemToDelete !== null}
        title='Delete Clothing Item'
        message={`Are you sure you want to completely delete "${itemToDelete?.name}"? It will be removed from all outfits it is currently part of. This cannot be undone.`}
        confirmLabel='Delete Item'
        variant='danger'
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default ClothingList;
