import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LoadStatus, RootState } from '../../store';
import { Line } from 'react-chartjs-2';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { portfoliosActions } from '../../store';
import { useAppDispatch } from '../../store/hooks';

type AgeMaxDrawdownDependenceGraphProps = {
  data: any;
};

const AgeMaxDrawdownDependenceGraph: FC<AgeMaxDrawdownDependenceGraphProps> = ({ data }) => {
  const dispatch = useAppDispatch();
  const { ageMaxDrawdownDependenceLoadingStatus } = useSelector(
    (state: RootState) => state.portfolios
  );

  const defaultColor = 'rgba(255, 99, 132, 0.2)';
  const [pointBackgroundColor, setPointBackgroundColor] = useState(
    new Array(data[0].length).fill(defaultColor)
  );
  const [age, setAge] = useState(0);

  useEffect(() => {
    syncRangeWithAge(0);
  }, [data]);

  function syncRangeWithAge(age: number) {
    dispatch(portfoliosActions.setPersonalMaxDrawdown(data[1][age]));
    setAge(age);
    setPointBackgroundColor(
      pointBackgroundColor.map((_color, index) => {
        if (index === Number(age)) {
          return 'rgba(2, 110, 156, 1)';
        } else {
          return defaultColor;
        }
      })
    );
  }

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const age = Number(event.target.value);
    syncRangeWithAge(age);
  };

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
          {ageMaxDrawdownDependenceLoadingStatus === LoadStatus.LOADING ? (
            <p>Loading...</p>
          ) : ageMaxDrawdownDependenceLoadingStatus === LoadStatus.FAILED ? (
            <p>Failed to load age max drawdown dependence data.</p>
          ) : (
            <Line data={chartData} height={'100%'} />
          )}
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
};

export default AgeMaxDrawdownDependenceGraph;
