import axios from 'axios';
import React from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setToken } from '../Auth/TokenSlice';
interface LoginFormInputs {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInputs>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = (data: LoginFormInputs): void => {
    const params = {
      username: data.username,
      password: data.password
    };

    void toast.promise(
      axios.post('http://127.0.0.1:8000/api/accounts/token/', params).then((response) => {
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        dispatch(setToken(response.data.access));
        navigate('/');
      }),
      {
        pending: 'Logging in...',
        success: 'Logged in!',
        error: 'Error logging in.'
      }
    );
  };

  return (
    <Container>
      <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Col sm={12} md={6}>
          <Card>
            <Card.Body>
              <h3 className="card-title text-center text-secondary mt-3">Login Form</h3>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    {...register('username', { required: true })}
                    isInvalid={!(errors.username == null)}
                  />
                  {errors.username != null && (
                    <Form.Control.Feedback type="invalid">
                      Username is required.
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    {...register('password', { required: true })}
                    isInvalid={!(errors.password == null)}
                  />
                  {errors.password != null && (
                    <Form.Control.Feedback type="invalid">
                      Password is required.
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <div className="text-center mt-4">
                  <Button type="submit">Submit</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
