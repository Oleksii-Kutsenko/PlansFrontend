import { FC, useState } from 'react';
import { Button, Container, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useDeleteOutfitMutation, useFetchOutfitQuery } from '@/store/api/clothingApi';

import ConfirmModal from '../../components/ConfirmModal';
import OutfitEdit from './OutfitEdit';
import OutfitView from './OutfitView';

const OutfitDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const outfitId = Number(id);
  const navigate = useNavigate();

  const { data: currentOutfit, isLoading, isError } = useFetchOutfitQuery(outfitId);
  const [deleteOutfit] = useDeleteOutfitMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteOutfit = async (): Promise<void> => {
    try {
      await deleteOutfit(outfitId).unwrap();
      toast.success('Outfit deleted.');
      void navigate('/clothing');
    } catch {
      toast.error('Failed to delete outfit.');
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading outfit details...</p>
      </Container>
    );
  }

  if (isError || !currentOutfit) {
    return (
      <Container className="mt-5 text-center">
        <p>Failed to load outfit.</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={() => void navigate('/clothing')}>
          <i className="bi bi-arrow-left me-2"></i>Back to Outfits
        </Button>
        <div>
          {isEditing ? (
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
              }}
            >
              Cancel Edit
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                className="me-2"
                onClick={() => {
                  setIsEditing(true);
                }}
              >
                <i className="bi bi-pencil me-2"></i>Edit Outfit
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowDeleteModal(true);
                }}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <OutfitEdit
          outfit={currentOutfit}
          onEditComplete={() => {
            setIsEditing(false);
          }}
        />
      ) : (
        <OutfitView outfit={currentOutfit} />
      )}

      <ConfirmModal
        show={showDeleteModal}
        title="Delete Outfit"
        message={`Are you sure you want to completely delete "${currentOutfit.outfitName}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteOutfit}
        onCancel={() => {
          setShowDeleteModal(false);
        }}
      />
    </Container>
  );
};

export default OutfitDetail;
