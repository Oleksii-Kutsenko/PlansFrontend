import { FC, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import ClothingCard from '../../components/clothing/ClothingCard';
import ClothingPicker from '../../components/clothing/ClothingPicker';
import { RootState } from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { clothingActions, Outfit, OutfitUpdate } from '../../store/slices/clothing';

interface OutfitEditProps {
  outfit: Outfit;
  onEditComplete: () => void;
}

interface OutfitFormValues {
  id: number;
  outfitName: string;
  season: string;
  occasion: number;
  previewImage: FileList;
}

const OutfitEdit: FC<OutfitEditProps> = ({ outfit, onEditComplete }) => {
  const dispatch = useAppDispatch();

  // Redux Data
  const clothingItems = useSelector((state: RootState) => state.clothing.clothing);
  const occasions = useSelector((state: RootState) => state.clothing.occasions);
  const clothingOptions = useSelector(
    (state: RootState) =>
      state.clothing.options as { clothingType?: { value: string; displayName: string }[] } | null
  );
  const outfitOptions = useSelector(
    (state: RootState) =>
      state.clothing.outfitOptions as { season?: { value: string; displayName: string }[] } | null
  );

  // Local State
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([]);
  const [isAddingItems, setIsAddingItems] = useState(false);

  const { register, handleSubmit, reset } = useForm<OutfitFormValues>();

  useEffect(() => {
    reset({
      id: outfit.id,
      outfitName: outfit.outfitName,
      occasion: outfit.occasion,
      season: outfit.season
    });
  }, [outfit, reset]);

  const availableItemsToAdd = useMemo(() => {
    if (!outfit.clothings) return clothingItems;
    const currentIds = new Set(outfit.clothings.map((c) => (typeof c === 'number' ? c : c.id)));
    return clothingItems.filter((item) => !currentIds.has(item.id));
  }, [clothingItems, outfit]);

  const onSaveMetadata = (data: OutfitFormValues) => {
    const payload: OutfitUpdate = {
      id: data.id,
      outfitName: data.outfitName,
      occasion: data.occasion,
      season: data.season
    };
    if (data.previewImage && data.previewImage.length > 0) {
      payload.previewImage = data.previewImage[0] ?? null;
    }

    dispatch(clothingActions.updateOutfit(payload))
      .unwrap()
      .then(() => {
        toast.success('Outfit updated successfully!');
        onEditComplete(); // Turn off edit mode
      })
      .catch(() => toast.error('Failed to update outfit metadata.'));
  };

  const handleAddSelectedItems = async () => {
    if (selectedToAdd.length === 0) return;
    setIsAddingItems(true);

    let successCount = 0;
    for (const clothingId of selectedToAdd) {
      try {
        await dispatch(
          clothingActions.addItemToOutfit({ outfitId: outfit.id, clothingId })
        ).unwrap();
        successCount++;
      } catch (error) {
        console.error(error);
        toast.error(`Failed to add item ID ${clothingId}`);
      }
    }

    if (successCount > 0) toast.success(`Added ${successCount} items to outfit!`);
    setSelectedToAdd([]);
    setIsAddingItems(false);
  };

  const handleRemoveItem = (clothingId: number) => {
    dispatch(clothingActions.removeItemFromOutfit({ outfitId: outfit.id, clothingId }))
      .unwrap()
      .then(() => toast.success('Item removed from outfit.'))
      .catch(() => toast.error('Failed to remove item.'));
  };

  return (
    <div className='mb-5'>
      <div className='bg-white p-4 rounded border shadow-sm mb-5'>
        <h3 className='mb-4'>Edit Metadata</h3>
        <Form onSubmit={(e) => void handleSubmit(onSaveMetadata)(e)}>
          <div className='row'>
            <Form.Group className='mb-3 col-md-4' controlId='outfitName'>
              <Form.Label>Outfit Name</Form.Label>
              <Form.Control type='text' {...register('outfitName', { required: true })} />
            </Form.Group>

            <Form.Group className='mb-3 col-md-4' controlId='occasion'>
              <Form.Label>Occasion</Form.Label>
              <Form.Select {...register('occasion')}>
                <option value=''>Select Occasion</option>
                {occasions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.occasionName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className='mb-3 col-md-4' controlId='season'>
              <Form.Label>Season</Form.Label>
              <Form.Select {...register('season')}>
                <option value=''>Select Season</option>
                {(outfitOptions?.season ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.displayName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          <Form.Group className='mb-4' controlId='previewImage'>
            <Form.Label>Update Preview Image (Optional)</Form.Label>
            <Form.Control type='file' accept='image/*' {...register('previewImage')} />
          </Form.Group>

          <div className='text-end'>
            <Button variant='success' type='submit'>
              <i className='bi bi-check-circle me-2'></i>Save Metadata Changes
            </Button>
          </div>
        </Form>
      </div>

      <div className='bg-white p-4 rounded border shadow-sm mb-5'>
        <h3 className='mb-4'>Current Clothing Items</h3>
        <p className='text-muted mb-4'>
          Click &quot;Remove&quot; to instantly take an item out of this outfit.
        </p>
        {Array.isArray(outfit.clothings) && outfit.clothings.length > 0 ? (
          <Row xs={2} md={3} lg={4} className='g-3'>
            {outfit.clothings.map((item, index) => {
              if (typeof item === 'number') return null;
              return (
                <Col key={item.id ?? index}>
                  <ClothingCard item={item} removable={true} onRemove={handleRemoveItem} />
                </Col>
              );
            })}
          </Row>
        ) : (
          <p className='text-muted'>No items.</p>
        )}
      </div>

      <div className='bg-light p-4 rounded border'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h3 className='mb-0'>Add More Items</h3>
          <Button
            variant='primary'
            onClick={() => void handleAddSelectedItems()}
            disabled={selectedToAdd.length === 0 || isAddingItems}
          >
            {isAddingItems ? <Spinner size='sm' /> : `Add ${selectedToAdd.length} Selected Items`}
          </Button>
        </div>

        <ClothingPicker
          allItems={availableItemsToAdd}
          selectedIds={selectedToAdd}
          onSelectionChange={setSelectedToAdd}
          typeOptions={clothingOptions?.clothingType ?? []}
        />
      </div>
    </div>
  );
};

export default OutfitEdit;
