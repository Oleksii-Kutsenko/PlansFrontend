import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ClothingCreate } from '../../store/slices/clothing';
import { clothingActions, createClothing } from '../../store/slices/clothing';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { useForm } from 'react-hook-form';
import { Button, Container, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ValidationErrors } from '../../store/slices/utils';
import ImageColorPicker from '../../components/clothing/ImageColorPicker';

const CreateClothing = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const options = useSelector(
    (state: RootState) =>
      state.clothing.options as {
        clothingType?: { value: string; displayName: string }[];
      } | null
  );

  useEffect(() => {
    void dispatch(clothingActions.fetchClothingOptions());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors }
  } = useForm<ClothingCreate>();

  // Watch the image input so we can pass the file to the color picker
  const imageFiles = watch('imagePath') as unknown as FileList;
  const currentImageFile = imageFiles && imageFiles.length > 0 ? imageFiles[0] : null;

  const onSubmit = (data: ClothingCreate): void => {
    const payload = { ...data };

    // Convert FileList to File before dispatching
    if (payload.imagePath && (payload.imagePath as unknown as FileList).length > 0) {
      payload.imagePath = (payload.imagePath as unknown as FileList)[0];
    } else {
      delete payload.imagePath;
    }

    void dispatch(createClothing(payload))
      .then((res) => {
        if (createClothing.fulfilled.match(res)) {
          void dispatch(clothingActions.fetchClothing());
          void navigate('/clothing/all');
        } else if (createClothing.rejected.match(res)) {
          const error = res.payload as ValidationErrors;
          const errorMessage = error?.errorMessage ?? 'Error adding clothing item.';
          toast.error(errorMessage);

          Object.keys(error).forEach((field: string) => {
            const key = field as keyof ClothingCreate;
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
    <Container className='mt-5 mb-5' style={{ maxWidth: '600px' }}>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='mb-0'>Add Clothing Item</h1>
        <Button variant='outline-secondary' onClick={() => navigate('/clothing/all')}>
          Cancel
        </Button>
      </div>

      <div className='bg-light p-4 rounded border shadow-sm'>
        <Form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          <Form.Group className='mb-3' controlId='name'>
            <Form.Label className='fw-medium'>Name</Form.Label>
            <Form.Control
              className={`${errors.name ? 'is-invalid' : ''}`}
              type='text'
              placeholder='e.g. Favorite Blue Jeans'
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <Form.Control.Feedback type='invalid'>{errors.name.message}</Form.Control.Feedback>
            )}
          </Form.Group>

          <Row>
            <Form.Group className='mb-3 col-md-8' controlId='clothingType'>
              <Form.Label className='fw-medium'>Type</Form.Label>
              <Form.Select
                className={`${errors.clothingType ? 'is-invalid' : ''}`}
                {...register('clothingType', { required: 'Clothing type is required' })}
              >
                <option value=''>Select Type</option>
                {(options?.clothingType ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.displayName}
                  </option>
                ))}
              </Form.Select>
              {errors.clothingType && (
                <Form.Control.Feedback type='invalid'>
                  {errors.clothingType.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className='mb-3 col-md-4' controlId='color'>
              <Form.Label className='fw-medium'>Main Color</Form.Label>
              <Form.Control
                type='color'
                className='w-100 p-1'
                title='Choose your color'
                style={{ height: '38px', cursor: 'pointer' }}
                {...register('color')}
                defaultValue='#000000'
              />
            </Form.Group>
          </Row>

          <Form.Group controlId='imagePath' className='mb-4'>
            <Form.Label className='fw-medium'>Image</Form.Label>
            <Form.Control
              className={`${errors.imagePath ? 'is-invalid' : ''}`}
              type='file'
              accept='image/*'
              {...register('imagePath')}
            />
            {errors.imagePath && (
              <Form.Control.Feedback type='invalid'>
                {errors.imagePath.message}
              </Form.Control.Feedback>
            )}

            {/* The Magic Color Picker preview component! */}
            <ImageColorPicker
              imageFile={currentImageFile}
              onColorPick={(hex) =>
                setValue('color', hex, { shouldValidate: true, shouldDirty: true })
              }
            />
          </Form.Group>

          <div className='d-grid mt-4'>
            <Button variant='success' size='lg' type='submit'>
              Save Clothing Item
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default CreateClothing;
