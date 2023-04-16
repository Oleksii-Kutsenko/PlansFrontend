import { Container, Row } from 'react-bootstrap';

const Home: React.FC = () => {
  return (
    <>
      <Container>
        <Row className="justify-content-center align-items-center text-center">
          <p className="muted display-6">Hello User👋</p>
        </Row>
      </Container>
    </>
  );
};

export default Home;
