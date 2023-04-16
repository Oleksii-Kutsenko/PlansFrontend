import axios from 'axios';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';

interface FormValues {
  birthDate: string;
  country: { label: string };
  username: string;
  password: string;
  password2: string;
}

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
    defaultValues: { birthDate: '', country: {}, username: '', password: '', password2: '' }
  });
  const [options, setOptions] = useState([]);
  const onSubmit = (data: FormValues): void => {
    const params = {
      birth_date: data.birthDate,
      country: data.country.label,
      username: data.username,
      password: data.password,
      password2: data.password2
    };

    void toast.promise(
      axios
        .post('http://127.0.0.1:8000/api/accounts/register/', params)
        .then(() => {
          navigate('/login');
        })
        .catch((error) => {
          const errors = error.response.data;
          for (const key in errors) {
            setError(key as keyof FormValues, { message: errors[key] });
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
        const response = await axios.get('http://127.0.0.1:8000/api/countries/');
        const newOptions = response.data.map((country: { name: string }) => {
          return { label: country.name };
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
      <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Col sm={12} md={6}>
          <Card className="mb-3 mt-3 rounded">
            <Card.Body>
              <h3 className="card-title text-center text-secondary mt-3 mb-3">Sign Up Form</h3>
              <Form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Form.Group>
                  <Form.Label>Birth Date</Form.Label>
                  <Form.Control
                    type="date"
                    {...register('birthDate', {
                      required: 'Birth Date is required!'
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
                        options={options}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('username', {
                      required: 'Username is required!'
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
                      required: 'Password is required!'
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
                      validate: (value) => value === watch('password') || "Passwords don't match."
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
