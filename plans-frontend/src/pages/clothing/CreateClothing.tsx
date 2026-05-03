import { ClothingCreate, createClothing } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { useForm } from 'react-hook-form';
import { Button, Container, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ValidationErrors } from '../../store/slices/utils';

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
    // Convert FileList to File before dispatching if it exists
    const payload = { ...data };
    if (payload.image_path && (payload.image_path as unknown as FileList).length > 0) {
      payload.image_path = (payload.image_path as unknown as FileList)[0];
    } else {
      delete payload.image_path;
    }

    void dispatch(createClothing(payload))
      .then((res) => {
        if (createClothing.fulfilled.match(res)) {
          void navigate('/clothing');
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
    <Container>
      <h1>Create Clothing</h1>
      <Form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
        <Form.Group className='mb-3' controlId='name'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            className={`${errors.name ? `is-invalid` : ``}`}
            type='text'
            placeholder='Enter clothing name'
            {...register('name')}
          />
          {errors.name !== null && (
            <Form.Control.Feedback type='invalid'>{errors.name?.message}</Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group className='mb-3' controlId='clothing_type'>
          <Form.Label>Type</Form.Label>
          <Form.Select
            className={`${errors.clothing_type ? `is-invalid` : ``}`}
            aria-label='Default select example'
            {...register('clothing_type')}
          >
            <option>Outerwear</option>
            <option>Tops</option>
            <option>Bottoms</option>
            <option>Dresses and Jumpsuits</option>
            <option>Activewear</option>
            <option>Swimwear</option>
            <option>Sleepwear and Loungewear</option>
            <option>Underwear and Lingerie</option>
            <option>Footwear</option>
            <option>Accessories</option>
          </Form.Select>
          {errors.clothing_type !== null && (
            <Form.Control.Feedback type='invalid'>
              {errors.clothing_type?.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group controlId='image_path' className='mb-3'>
          <Form.Label>Image</Form.Label>
          <Form.Control
            className={`${errors.image_path ? `is-invalid` : ``}`}
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
