import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ClothingCreate } from '../../store/slices/clothing';
import { clothingActions, createClothing } from '../../store/slices/clothing';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { useForm } from 'react-hook-form';
import { Button, Container, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ValidationErrors } from '../../store/slices/utils';
import ImageColorPicker from '../../components/clothing/ImageColorPicker';

interface CreateClothingFormValues {
  name: string;
  clothingType: string;
  color: string;
  imagePath: FileList;
}

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
  } = useForm<CreateClothingFormValues>();

  // Watch the image input so we can pass the file to the color picker
  const imageFiles = watch('imagePath');
  let currentImageFile = null;
  if (imageFiles && imageFiles.length > 0) {
    currentImageFile = imageFiles[0] ?? null;
  }

  const onSubmit = async (data: CreateClothingFormValues): Promise<void> => {
    const imagePath = data.imagePath[0] ?? null;
    if (imagePath) {
      const payload: ClothingCreate = {
        name: data.name,
        clothingType: data.clothingType,
        color: data.color,
        imagePath: imagePath
      };

      try {
        await dispatch(createClothing(payload)).unwrap();

        void dispatch(clothingActions.fetchClothing());
        void navigate('/clothing/clothing');
      } catch (err: any) {
        console.error(err);
        const error = err as ValidationErrors;

        const errorMessage = error?.errorMessage ?? 'Error adding clothing item.';
        toast.error(errorMessage);

        if (error) {
          Object.keys(error).forEach((field: string) => {
            const key = field as keyof CreateClothingFormValues;
            error[key]?.forEach((message: string) => {
              toast.error(`${key}: ${message}`);
              setError(key, { type: 'custom', message: message });
            });
          });
        }
      }
    } else {
      toast.error('Please upload an image!');
      throw Error('Image is null or undefined.');
    }
  };

  return (
    <Container className='mt-5 mb-5' style={{ maxWidth: '600px' }}>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='mb-0'>Add Clothing Item</h1>
        <Button variant='outline-secondary' onClick={() => void navigate('/clothing/clothing')}>
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
                {...register('color', { required: 'Main color is required' })}
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
              {...register('imagePath', { required: 'An image is required!' })}
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
