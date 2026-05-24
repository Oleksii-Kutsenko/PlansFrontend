import type { FC } from 'react';
import { Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';

import { useFetchCountryListQuery } from '@/features/countries/api/countriesApi';
import { handleApiFormError } from '@/utils/errorUtils';

import { useRegisterMutation } from '../api/authApi';

interface FormValues {
  birthDate: string;
  country: { label: string; value: number };
  username: string;
  password: string;
  password2: string;
}

const SignUp: FC = () => {
  const navigate = useNavigate();

  const { data: countries, isLoading } = useFetchCountryListQuery();
  const [registerUser] = useRegisterMutation();

  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      birthDate: '',
      country: { label: '', value: -1 },
      username: '',
      password: '',
      password2: '',
    },
  });

  if (isLoading || !countries) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const countryOptions = countries.map((c) => ({ label: c.name, value: c.id }));

  const onSubmit = async (data: FormValues): Promise<void> => {
    const params = {
      birthDate: data.birthDate,
      country: data.country.value,
      username: data.username,
      password: data.password,
      password2: data.password2,
    };

    try {
      await registerUser(params).unwrap();
      toast.success('Signed up!');
      void navigate('/login');
    } catch (error: unknown) {
      handleApiFormError(error, setError, 'Error signing up.');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Col sm={12} md={6}>
          <Card className="mb-3 mt-3 rounded">
            <Card.Body>
              <h3 className="card-title text-center text-secondary mt-3 mb-3">Sign Up Form</h3>
              <Form autoComplete="off" onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
                <Form.Group>
                  <Form.Label>Birth Date</Form.Label>
                  <Form.Control
                    type="date"
                    {...register('birthDate', {
                      required: 'Birth Date is required!',
                    })}
                  />
                  {errors.birthDate != null && (
                    <Form.Text className="text-danger" style={{ fontSize: 14 }}>
                      {errors.birthDate.message?.toString()}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <br />
                  {errors.country != null && (
                    <Form.Text className="text-danger" style={{ fontSize: 14 }}>
                      {errors.country.message?.toString()}
                    </Form.Text>
                  )}
                  <Controller
                    name="country"
                    control={control}
                    rules={{ required: 'Country is required!' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value}
                        onChange={field.onChange}
                        ref={field.ref}
                        options={countryOptions}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('username', {
                      required: 'Username is required!',
                    })}
                  />
                  {errors.username != null && (
                    <Form.Text className="text-danger" style={{ fontSize: 14 }}>
                      {errors.username.message?.toString()}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    {...register('password', {
                      required: 'Password is required!',
                    })}
                  />
                  {errors.password != null && (
                    <Form.Text className="text-danger" style={{ fontSize: 14 }}>
                      {errors.password.message?.toString()}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    {...register('password2', {
                      required: 'Confirm Password is required',
                      validate: (value) => value === watch('password') || `Passwords don't match.`,
                    })}
                  />
                  {errors.password2 != null && (
                    <Form.Text className="text-danger" style={{ fontSize: 14 }}>
                      {errors.password2.message?.toString()}
                    </Form.Text>
                  )}
                </Form.Group>
                <div className="text-center mt-4">
                  <Button className="text-center mb-3" type="submit">
                    Submit
                  </Button>
                  <p className="card-text">
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
