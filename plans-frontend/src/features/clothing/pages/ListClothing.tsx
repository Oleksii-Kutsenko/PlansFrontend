import { FC, useMemo, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import ConfirmModal from '../../../components/ConfirmModal';
import {
  useDeleteClothingMutation,
  useFetchClothingOptionsQuery,
  useFetchClothingQuery,
} from '../api/clothingApi';
import ClothingCard from '../components/ClothingCard';
import ClothingFilters, { ClothingFilterState } from '../components/ClothingFilters';

const ClothingList: FC = () => {
  const navigate = useNavigate();

  const { data: clothingItems = [] } = useFetchClothingQuery();
  const { data: clothingOptions } = useFetchClothingOptionsQuery();
  const [deleteClothing] = useDeleteClothingMutation();

  // Local state
  const [filters, setFilters] = useState<ClothingFilterState>({
    searchQuery: '',
    selectedType: '',
  });

  // Modal state
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);

  const filteredClothing = useMemo(() => {
    return clothingItems.filter((item) => {
      const matchesSearch = item.name
        ? item.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
        : false;
      const matchesType = filters.selectedType ? item.clothingType === filters.selectedType : true;
      return matchesSearch && matchesType;
    });
  }, [clothingItems, filters]);

  const confirmDelete = async (): Promise<void> => {
    if (!itemToDelete) return;

    try {
      await deleteClothing(itemToDelete.id).unwrap();
      toast.success('Clothing deleted successfully');
    } catch {
      toast.error('Failed to delete clothing');
    }

    setItemToDelete(null);
  };

  let content: React.ReactNode;
  if (clothingItems.length === 0) {
    content = (
      <div className="text-center py-5 bg-light rounded border">
        <h4 className="text-muted mb-3">Your wardrobe is completely empty.</h4>
        <Button variant="success" onClick={() => void navigate('/clothing/create')}>
          Add Your First Item
        </Button>
      </div>
    );
  } else if (filteredClothing.length === 0) {
    content = (
      <div className="text-center py-5 bg-light rounded border">
        <p className="text-muted mb-0 fs-5">No clothing items match your current filters.</p>
      </div>
    );
  } else {
    content = (
      <Row xs={2} sm={3} md={4} lg={5} className="g-4">
        {filteredClothing.map((item) => (
          <Col key={item.id}>
            <ClothingCard
              item={item}
              removable={true}
              // eslint-disable-next-line @typescript-eslint/require-await
              onRemove={async () => {
                setItemToDelete({ id: item.id, name: item.name });
              }}
            />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>All Clothing Items</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => void navigate('/clothing')}>
            <i className="bi bi-arrow-left me-2"></i>Back to Outfits
          </Button>
          <Button variant="success" onClick={() => void navigate('/clothing/create')}>
            Add New Item
          </Button>
        </div>
      </div>

      <ClothingFilters typeOptions={clothingOptions?.clothingType ?? []} onChange={setFilters} />
      {content}

      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        show={itemToDelete !== null}
        title="Delete Clothing Item"
        message={`Are you sure you want to completely delete "${String(itemToDelete?.name)}"? It will be removed from all outfits it is currently part of. This cannot be undone.`}
        confirmLabel="Delete Item"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setItemToDelete(null);
        }}
      />
    </div>
  );
};

export default ClothingList;
