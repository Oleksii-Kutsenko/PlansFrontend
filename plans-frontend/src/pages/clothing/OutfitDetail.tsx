import { FC, useEffect, useState } from 'react';
import { Button, Container, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import ConfirmModal from '../../components/ConfirmModal';
import { RootState } from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { clothingActions } from '../../store/slices/clothing';
import OutfitEdit from './OutfitEdit';
// Import our newly separated components
import OutfitView from './OutfitView';

const OutfitDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const outfitId = Number(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Global State
  const currentOutfit = useSelector((state: RootState) => state.clothing.currentOutfit);

  // Local State
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Initialization
  useEffect(() => {
    if (outfitId) {
      void dispatch(clothingActions.fetchOutfit(outfitId));
      void dispatch(clothingActions.fetchClothing());
      void dispatch(clothingActions.fetchOccasions());
      void dispatch(clothingActions.fetchClothingOptions());
      void dispatch(clothingActions.fetchOutfitOptions());
    }
  }, [dispatch, outfitId]);

  const handleDeleteOutfit = () => {
    dispatch(clothingActions.deleteOutfit(outfitId))
      .unwrap()
      .then(() => {
        toast.success('Outfit deleted.');
        void navigate('/clothing');
      })
      .catch(() => toast.error('Failed to delete outfit.'));
  };

  if (!currentOutfit) {
    return (
      <Container className='mt-5 text-center'>
        <Spinner animation='border' variant='primary' />
        <p className='mt-3'>Loading outfit details...</p>
      </Container>
    );
  }

  return (
    <Container className='mt-5 mb-5'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <Button variant='outline-secondary' onClick={() => void navigate('/clothing')}>
          <i className='bi bi-arrow-left me-2'></i>Back to Outfits
        </Button>
        <div>
          {isEditing ? (
            <Button
              variant='secondary'
              onClick={() => {
                setIsEditing(false);
              }}
            >
              Cancel Edit
            </Button>
          ) : (
            <>
              <Button
                variant='primary'
                className='me-2'
                onClick={() => {
                  setIsEditing(true);
                }}
              >
                <i className='bi bi-pencil me-2'></i>Edit Outfit
              </Button>
              <Button
                variant='danger'
                onClick={() => {
                  setShowDeleteModal(true);
                }}
              >
                <i className='bi bi-trash'></i>
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
        title='Delete Outfit'
        message={`Are you sure you want to completely delete "${currentOutfit.outfitName}"? This cannot be undone.`}
        confirmLabel='Delete'
        variant='danger'
        onConfirm={handleDeleteOutfit}
        onCancel={() => {
          setShowDeleteModal(false);
        }}
      />
    </Container>
  );
};

export default OutfitDetail;
