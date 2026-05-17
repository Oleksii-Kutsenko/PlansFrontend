import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { fetcher } from '../utils/axios';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';

interface FormValues {
  birthDate: string;
  country: { label: string; value: number };
  username: string;
  password: string;
  password2: string;
}

interface CountryResponse {
  id: number;
  name: string;
}

interface NewOptions {
  label: string;
  value: number;
}

type DRFErrorPayload<Field extends string> = Partial<Record<Field, string[]>> & {
  non_field_errors?: string[];
  detail?: string;
};

type FormKey = Extract<keyof FormValues, string>;
type SignUpFormDRFError = DRFErrorPayload<FormKey>;

const SignUp: FC = () => {
  const navigate = useNavigate();
  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      birthDate: '',
      country: { label: '', value: -1 },
      username: '',
      password: '',
      password2: ''
    }
  });
  const [options, setOptions] = useState<NewOptions[]>([]);
  const onSubmit = (data: FormValues): void => {
    const params = {
      // eslint-disable-next-line camelcase
      birth_date: data.birthDate,
      country: data.country.value,
      username: data.username,
      password: data.password,
      password2: data.password2
    };

    void toast.promise(
      fetcher
        .post('/api/accounts/register/', params)
        .then(() => {
          void navigate('/login');
        })
        .catch((error: unknown) => {
          if (!axios.isAxiosError<SignUpFormDRFError>(error) || !error.response) {
            throw error;
          }

          const errors = error.response.data;

          for (const [key, value] of Object.entries(errors)) {
            const message = Array.isArray(value) ? value.join(' ') : String(value);

            if (key === 'non_field_errors' || key === 'detail') {
              setError('root', { message });
              continue;
            }

            setError(key as FormKey, { message });
          }

          throw error;
        }),
      {
        pending: 'Signing up...',
        success: 'Signed up!',
        error: 'Error signing up.'
      }
    );
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await fetcher.get<CountryResponse[]>('/api/countries/');
        const newOptions = response.data.map((country: { name: string; id: number }) => {
          return { label: country.name, value: country.id };
        });
        setOptions(newOptions);
      } catch (error) {
        console.error(error);
      }
    };
    void fetchData();
  }, []);

  return (
    <Container>
      <Row className='justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
        <Col sm={12} md={6}>
          <Card className='mb-3 mt-3 rounded'>
            <Card.Body>
              <h3 className='card-title text-center text-secondary mt-3 mb-3'>Sign Up Form</h3>
              <Form autoComplete='off' onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
                <Form.Group>
                  <Form.Label>Birth Date</Form.Label>
                  <Form.Control
                    type='date'
                    {...register('birthDate', {
                      required: 'Birth Date is required!'
                    })}
                  />
                  {errors.birthDate != null && (
                    <Form.Text className='text-danger' style={{ fontSize: 14 }}>
                      {errors.birthDate.message?.toString()}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <br />
                  {errors.country != null && (
                    <Form.Text className='text-danger' style={{ fontSize: 14 }}>
                      {errors.country.message?.toString()}
                    </Form.Text>
                  )}
                  <Controller
                    name='country'
                    control={control}
                    rules={{ required: 'Country is required!' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || null}
                        onChange={field.onChange}
                        ref={field.ref}
                        options={options}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type='text'
                    {...register('username', {
                      required: 'Username is required!'
                    })}
                  />
                  {errors.username != null && (
                    <Form.Text className='text-danger' style={{ fontSize: 14 }}>
                      {errors.username.message?.toString()}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type='password'
                    {...register('password', {
                      required: 'Password is required!'
                    })}
                  />
                  {errors.password != null && (
                    <Form.Text className='text-danger' style={{ fontSize: 14 }}>
                      {errors.password.message?.toString()}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type='password'
                    {...register('password2', {
                      required: 'Confirm Password is required',
                      validate: (value) => value === watch('password') || `Passwords don't match.`
                    })}
                  />
                  {errors.password2 != null && (
                    <Form.Text className='text-danger' style={{ fontSize: 14 }}>
                      {errors.password2.message?.toString()}
                    </Form.Text>
                  )}
                </Form.Group>
                <div className='text-center mt-4'>
                  <Button className='text-center mb-3' type='submit'>
                    Submit
                  </Button>
                  <p className='card-text'>
                    Already have an account?{' '}
                    <Link style={{ textDecoration: 'none' }} to={'/login'}>
                      Log In
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUp;
