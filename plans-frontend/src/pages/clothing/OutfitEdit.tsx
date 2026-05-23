import { FC, useMemo, useState } from 'react';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  Occasion,
  Outfit,
  OutfitUpdate,
  useAddItemToOutfitMutation,
  useFetchClothingOptionsQuery,
  useFetchClothingQuery,
  useFetchOccasionsQuery,
  useFetchOutfitOptionsQuery,
  useRemoveItemFromOutfitMutation,
  useUpdateOutfitMutation,
} from '@/store/api/clothingApi';

import ClothingCard from '../../components/clothing/ClothingCard';
import ClothingPicker from '../../components/clothing/ClothingPicker';

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
  const [updateOutfit] = useUpdateOutfitMutation();
  const [addItemToOutfit] = useAddItemToOutfitMutation();
  const [removeItemFromOutfit] = useRemoveItemFromOutfitMutation();

  const { data: clothingItems = [] } = useFetchClothingQuery();
  const { data: occasions = [] } = useFetchOccasionsQuery();
  const { data: clothingOptions } = useFetchClothingOptionsQuery();
  const { data: outfitOptions } = useFetchOutfitOptionsQuery();

  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([]);
  const [isAddingItems, setIsAddingItems] = useState(false);

  const { register, handleSubmit } = useForm<OutfitFormValues>({
    values: {
      id: outfit.id,
      outfitName: outfit.outfitName,
      occasion: outfit.occasion,
      season: outfit.season,
    },
  });

  const availableItemsToAdd = useMemo(() => {
    const currentIds = new Set(outfit.clothings.map((c) => (typeof c === 'number' ? c : c.id)));
    return clothingItems.filter((item) => !currentIds.has(item.id));
  }, [clothingItems, outfit]);

  const onSaveMetadata = async (data: OutfitFormValues): Promise<void> => {
    const payload: OutfitUpdate = {
      id: data.id,
      outfitName: data.outfitName,
      occasion: data.occasion,
      season: data.season,
    };
    if (data.previewImage.length > 0) {
      payload.previewImage = data.previewImage[0] ?? null;
    }

    try {
      await updateOutfit(payload).unwrap();
      toast.success('Outfit updated successfully!');
      onEditComplete();
    } catch {
      toast.error('Failed to update outfit metadata.');
    }
  };

  const handleAddSelectedItems = async (): Promise<void> => {
    if (selectedToAdd.length === 0) return;
    setIsAddingItems(true);

    let successCount = 0;
    for (const clothingId of selectedToAdd) {
      try {
        await addItemToOutfit({ outfitId: outfit.id, clothingId }).unwrap();
        successCount++;
      } catch {
        toast.error(`Failed to add item ID ${String(clothingId)}`);
      }
    }

    if (successCount > 0) toast.success(`Added ${String(successCount)} items to outfit!`);
    setSelectedToAdd([]);
    setIsAddingItems(false);
  };

  const handleRemoveItem = async (clothingId: number): Promise<void> => {
    try {
      await removeItemFromOutfit({ outfitId: outfit.id, clothingId }).unwrap();
      toast.success('Item removed from outfit.');
    } catch {
      toast.error('Failed to remove item.');
    }
  };

  return (
    <div className="mb-5">
      <div className="bg-white p-4 rounded border shadow-sm mb-5">
        <h3 className="mb-4">Edit Metadata</h3>
        <Form onSubmit={(e) => void handleSubmit(onSaveMetadata)(e)}>
          <div className="row">
            <Form.Group className="mb-3 col-md-4" controlId="outfitName">
              <Form.Label>Outfit Name</Form.Label>
              <Form.Control type="text" {...register('outfitName', { required: true })} />
            </Form.Group>

            <Form.Group className="mb-3 col-md-4" controlId="occasion">
              <Form.Label>Occasion</Form.Label>
              <Form.Select {...register('occasion')}>
                <option value="">Select Occasion</option>
                {occasions.map((opt: Occasion) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.occasionName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3 col-md-4" controlId="season">
              <Form.Label>Season</Form.Label>
              <Form.Select {...register('season')}>
                <option value="">Select Season</option>
                {(outfitOptions?.season ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.displayName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          <Form.Group className="mb-4" controlId="previewImage">
            <Form.Label>Update Preview Image (Optional)</Form.Label>
            <Form.Control type="file" accept="image/*" {...register('previewImage')} />
          </Form.Group>

          <div className="text-end">
            <Button variant="success" type="submit">
              <i className="bi bi-check-circle me-2"></i>Save Metadata Changes
            </Button>
          </div>
        </Form>
      </div>

      <div className="bg-white p-4 rounded border shadow-sm mb-5">
        <h3 className="mb-4">Current Clothing Items</h3>
        <p className="text-muted mb-4">
          Click &quot;Remove&quot; to instantly take an item out of this outfit.
        </p>
        {Array.isArray(outfit.clothings) && outfit.clothings.length > 0 ? (
          <Row xs={2} md={3} lg={4} className="g-3">
            {outfit.clothings.map((item) => {
              if (typeof item === 'number') return null;
              return (
                <Col key={item.id}>
                  <ClothingCard item={item} removable={true} onRemove={handleRemoveItem} />
                </Col>
              );
            })}
          </Row>
        ) : (
          <p className="text-muted">No items.</p>
        )}
      </div>

      <div className="bg-light p-4 rounded border">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Add More Items</h3>
          <Button
            variant="primary"
            onClick={() => void handleAddSelectedItems()}
            disabled={selectedToAdd.length === 0 || isAddingItems}
          >
            {isAddingItems ? (
              <Spinner size="sm" />
            ) : (
              `Add ${String(selectedToAdd.length)} Selected Items`
            )}
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
