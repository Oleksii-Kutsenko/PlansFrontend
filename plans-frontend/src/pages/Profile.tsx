import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';
import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { userActions } from '../store';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();

  const { user, userLoading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (user === null && !userLoading) {
      dispatch(userActions.fetchCurrentUser()).catch((err) => {
        console.log(err);
      });
    }
  }, [dispatch, user, userLoading]);

  if (userLoading) {
    return (
      <Container className='mt-4 text-center'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </Spinner>
      </Container>
    );
  } else if (user !== null) {
    return (
      <Container className='mt-4'>
        <Row>
          <Col>
            <h2>Profile</h2>
          </Col>
        </Row>
        <Row className='mt-4'>
          <Col md={6}>
            <h5>Username:</h5>
            <p>{user.username}</p>
            <h5>Birth Date:</h5>
            <p>{user.birthDate}</p>
          </Col>
          <Col md={6}>
            <h5>Country:</h5>
            <p>{user.country}</p>
            <h5>Is Admin:</h5>
            <p>{user.isAdmin ? 'Yes' : 'No'}</p>
          </Col>
        </Row>
      </Container>
    );
  } else {
    return <p>Failed to load profile</p>;
  }
};

export default Profile;
