import { ClothingCreate, createClothing } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useForm } from 'react-hook-form';
import { Button, Container, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ValidationErrors } from 'store/slices/utils';

const CreateClothing = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ClothingCreate>();

  const onSubmit = (data: ClothingCreate): void => {
    dispatch(createClothing(data))
      .then((res) => {
        if (createClothing.fulfilled.match(res)) {
          navigate('/clothing');
        } else if (createClothing.rejected.match(res)) {
          const error = res.payload as ValidationErrors;
          const errorMessage = error?.errorMessage || 'Error adding clothing item.';
          toast.error(errorMessage);

          Object.keys(error).forEach((field: string) => {
            const key = field as keyof ClothingCreate;
            error[key].forEach((message: string) => {
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
    <Container>
      <h1>Create Clothing</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className='mb-3' controlId='name'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            className={`${errors.name ? `is-invalid` : ``}`}
            type='text'
            placeholder='Enter name'
            {...register('name')}
          />
          {errors.name !== null && (
            <Form.Control.Feedback type='invalid'>{errors.name?.message}</Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group className='mb-3' controlId='clothingType'>
          <Form.Label>Clothing Type</Form.Label>
          <Form.Control
            className={`${errors.name ? `is-invalid` : ``}`}
            type='select'
            placeholder='Enter clothing type'
            {...register('clothing_type')}
          />
          {errors.clothing_type !== null && (
            <Form.Control.Feedback type='invalid'>
              {errors.clothing_type?.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group className='mb-3' controlId='season'>
          <Form.Label>Season</Form.Label>
          <Form.Control
            className={`${errors.name ? `is-invalid` : ``}`}
            type='text'
            placeholder='Enter season'
            {...register('season')}
          />
          {errors.season !== null && (
            <Form.Control.Feedback type='invalid'>{errors.season?.message}</Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group className='mb-3' controlId='image'>
          <Form.Label>Image</Form.Label>
          <Form.Control
            className={`${errors.name ? `is-invalid` : ``}`}
            type='file'
            placeholder='Enter image'
            {...register('image_path')}
          />
          {errors.image_path !== null && (
            <Form.Control.Feedback type='invalid'>
              {errors.image_path?.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <div className='text-center mt-4'>
          <Button type='submit'>Submit</Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreateClothing;
