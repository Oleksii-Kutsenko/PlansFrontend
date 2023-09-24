import type { FC } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { LoadStatus, RootState } from '../../store';
import { Line } from 'react-chartjs-2';
import { Col, Container, Form, Row } from 'react-bootstrap';

const AgeMaxDrawdownDependenceGraph: FC<{ data: any }> = ({ data }) => {
  const { ageMaxDrawdownDependenceLoadingStatus } = useSelector(
    (state: RootState) => state.portfolios
  );

  const defaultColor = 'rgba(255, 99, 132, 0.2)';
  const [pointBackgroundColor, setPointBackgroundColor] = useState(
    new Array(data[0].length).fill(defaultColor)
  );

  const [age, setAge] = useState(0);
  const handleAgeChange = (event: any) => {
    setAge(event.target.value);
    setPointBackgroundColor(
      pointBackgroundColor.map((color, index) => {
        if (index === Number(event.target.value)) {
          return 'rgba(100, 150, 70, 1)';
        } else {
          return defaultColor;
        }
      })
    );
  };

  if (ageMaxDrawdownDependenceLoadingStatus === LoadStatus.SUCCEEDED) {
    const chartData = {
      labels: data[0],
      datasets: [
        {
          label: 'Max Drawdown',
          data: data[1],
          fill: false,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: defaultColor,
          pointBackgroundColor: pointBackgroundColor
        }
      ]
    };
    return (
      <Container>
        <Row>
          <Col>
            <Line data={chartData} height={'100%'} />
          </Col>
        </Row>
        <Row className='m-2'>
          <Col>
            <Form.Label>Range {age}</Form.Label>
            <Form.Range min={0} max={data[0].length - 1} value={age} onChange={handleAgeChange} />
          </Col>
        </Row>
      </Container>
    );
  } else if (ageMaxDrawdownDependenceLoadingStatus === LoadStatus.LOADING) {
    return <p>Loading...</p>;
  } else if (ageMaxDrawdownDependenceLoadingStatus === LoadStatus.FAILED) {
    return <p>Failed to load age max drawdown dependence data.</p>;
  } else {
    return <p>Unknown error.</p>;
  }
};

export default AgeMaxDrawdownDependenceGraph;
