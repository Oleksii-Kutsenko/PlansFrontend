import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { OutfitCreate, createOutfit } from '../../store';
import { clothingActions } from '../../store/slices/clothing';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { useForm } from 'react-hook-form';
import { Button, Container, Form, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ValidationErrors } from '../../store/slices/utils';

const CreateOutfit: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const clothingItems = useSelector((state: RootState) => state.clothing.clothing);
  const outfitOptions = useSelector(
    (state: RootState) =>
      state.clothing.outfitOptions as {
        occasion?: { value: string; display_name: string }[];
      } | null
  );

  const [selectedClothings, setSelectedClothings] = useState<number[]>([]);

  useEffect(() => {
    void dispatch(clothingActions.fetchClothing());
    void dispatch(clothingActions.fetchOutfitOptions());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<OutfitCreate>();

  const toggleClothing = (id: number) => {
    setSelectedClothings((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const onSubmit = (data: OutfitCreate): void => {
    const payload = { ...data, clothings: selectedClothings };

    if (selectedClothings.length === 0) {
      toast.error('Please select at least one clothing item for the outfit.');
      return;
    }

    void dispatch(createOutfit(payload))
      .then((res) => {
        if (createOutfit.fulfilled.match(res)) {
          void dispatch(clothingActions.fetchOutfits());
          void navigate('/clothing');
        } else if (createOutfit.rejected.match(res)) {
          const error = res.payload as ValidationErrors;
          const errorMessage = error?.errorMessage ?? 'Error adding outfit item.';
          toast.error(errorMessage);

          Object.keys(error).forEach((field: string) => {
            const key = field as keyof OutfitCreate;
            error[key]?.forEach((message: string) => {
              toast.error(`${key}: ${message}`);
              setError(key, { type: 'custom', message: message });
            });
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error('Unexpected error occured.');
      });
  };

  return (
    <Container className='mt-5 mb-5'>
      <h1 className='mb-4'>Create Outfit</h1>
      <Form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
        <Form.Group className='mb-3' controlId='outfit_name'>
          <Form.Label>Outfit Name</Form.Label>
          <Form.Control
            className={`${errors.outfit_name ? `is-invalid` : ``}`}
            type='text'
            placeholder='Enter outfit name'
            {...register('outfit_name')}
          />
          {errors.outfit_name !== null && (
            <Form.Control.Feedback type='invalid'>
              {errors.outfit_name?.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className='mb-3' controlId='occasion'>
          <Form.Label>Occasion</Form.Label>
          <Form.Select
            className={`${errors.occasion ? `is-invalid` : ``}`}
            aria-label='Select occasion'
            {...register('occasion')}
          >
            <option value=''>Select Occasion</option>
            {(outfitOptions?.occasion ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.display_name}
              </option>
            ))}
          </Form.Select>
          {errors.occasion !== null && (
            <Form.Control.Feedback type='invalid'>{errors.occasion?.message}</Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className='mb-4' controlId='clothings'>
          <Form.Label>Select Clothing Items</Form.Label>
          {clothingItems.length === 0 ? (
            <p className='text-muted'>No clothing items available. Please create some first.</p>
          ) : (
            <ListGroup>
              {clothingItems.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  action
                  active={selectedClothings.includes(item.id)}
                  onClick={() => {
                    void toggleClothing(item.id);
                  }}
                  className='d-flex justify-content-between align-items-center'
                >
                  <div>
                    <strong>{item.name}</strong> -{' '}
                    <span className='text-muted'>{item.clothing_type}</span>
                  </div>
                  {selectedClothings.includes(item.id) && (
                    <i className='bi bi-check-circle-fill text-white'></i>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Form.Group>

        <div className='mt-4'>
          <Button variant='primary' type='submit'>
            Submit Outfit
          </Button>
          <Button
            variant='secondary'
            className='ms-2'
            onClick={() => {
              void navigate('/clothing');
            }}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreateOutfit;
