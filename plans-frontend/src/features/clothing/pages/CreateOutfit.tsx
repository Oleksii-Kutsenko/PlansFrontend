import { FC, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { handleApiFormError } from '@/utils/errorUtils';

import {
  OutfitCreate,
  useCreateOutfitMutation,
  useFetchClothingOptionsQuery,
  useFetchClothingQuery,
  useFetchOccasionsQuery,
  useFetchOutfitOptionsQuery,
} from '../api/clothingApi';
import ClothingPicker from '../components/ClothingPicker';

interface CreateOutfitFormValues {
  outfitName: string;
  season: string;
  occasion: number;
  previewImage: FileList;
  clothingIds: number[];
}

const CreateOutfit: FC = () => {
  const navigate = useNavigate();

  const { data: clothingItems = [] } = useFetchClothingQuery();
  const { data: occasions = [] } = useFetchOccasionsQuery();
  const { data: clothingOptions } = useFetchClothingOptionsQuery();
  const { data: outfitOptions } = useFetchOutfitOptionsQuery();

  const [createOutfit] = useCreateOutfitMutation();

  const [selectedClothings, setSelectedClothings] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateOutfitFormValues>();

  const onSubmit = async (data: CreateOutfitFormValues): Promise<void> => {
    const previewImage = data.previewImage[0] ?? null;
    if (!previewImage) {
      toast.error('Please upload an image!');
      return;
    }

    const payload: OutfitCreate = {
      ...data,
      clothingIds: selectedClothings,
      previewImage: previewImage,
    };
    try {
      const newOutfit = await createOutfit(payload).unwrap();
      toast.success('Outfit created successfully!');
      void navigate(`/clothing/outfit/${String(newOutfit.id)}`);
    } catch (error: unknown) {
      handleApiFormError(error, setError, 'Failed to create outfit item.');
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <h1 className="mb-4">Create Outfit</h1>
      <Form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
        <div className="bg-light p-4 rounded border mb-4">
          <h4 className="mb-3">Outfit Details</h4>

          <Form.Group className="mb-3" controlId="outfitName">
            <Form.Label className="fw-medium">Outfit Name</Form.Label>
            <Form.Control
              className={errors.outfitName ? 'is-invalid' : ''}
              type="text"
              placeholder="e.g. Summer Beach Party"
              {...register('outfitName')}
            />
            {errors.outfitName && (
              <Form.Control.Feedback type="invalid">
                {errors.outfitName.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-6" controlId="occasion">
              <Form.Label className="fw-medium">Occasion</Form.Label>
              <Form.Select
                className={errors.occasion ? 'is-invalid' : ''}
                {...register('occasion')}
              >
                <option value="">Select Occasion</option>
                {occasions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.occasionName}
                  </option>
                ))}
              </Form.Select>
              {errors.occasion && (
                <Form.Control.Feedback type="invalid">
                  {errors.occasion.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3 col-md-6" controlId="season">
              <Form.Label className="fw-medium">Season</Form.Label>
              <Form.Select className={errors.season ? 'is-invalid' : ''} {...register('season')}>
                <option value="">Select Season</option>
                {(outfitOptions?.season ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.displayName}
                  </option>
                ))}
              </Form.Select>
              {errors.season && (
                <Form.Control.Feedback type="invalid">
                  {errors.season.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </div>

          <Form.Group className="mb-3" controlId="previewImage">
            <Form.Label className="fw-medium">Preview Image (Optional)</Form.Label>
            <Form.Control
              className={errors.previewImage ? 'is-invalid' : ''}
              type="file"
              accept="image/*"
              {...register('previewImage')}
            />
            <Form.Text className="text-muted">
              Upload a picture of the complete outfit, or leave blank to use individual item images.
            </Form.Text>
            {errors.previewImage && (
              <Form.Control.Feedback type="invalid">
                {errors.previewImage.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>

        <Form.Group className="mb-4">
          <h4 className="mb-3">Select Clothing Items</h4>
          <ClothingPicker
            allItems={clothingItems}
            selectedIds={selectedClothings}
            onSelectionChange={setSelectedClothings}
            typeOptions={clothingOptions?.clothingType ?? []}
          />
        </Form.Group>

        <div className="d-flex gap-2 justify-content-end mt-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              void navigate('/clothing');
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" size="lg" type="submit">
            Create Outfit
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreateOutfit;
