import './styles.css';

import type { ChangeEvent, FC } from 'react';
import { useEffect, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';

import {
  type AgeMaxDrawdownDependency,
  LoadStatus,
  portfoliosActions,
  RootState,
} from '../../../store';
import { useAppDispatch } from '../../../store/hooks';

const AGE_MIN = 18;

interface AgeMaxDrawdownDependenceGraphProps {
  graphData: AgeMaxDrawdownDependency[];
}

const AgeMaxDrawdownDependenceGraph: FC<AgeMaxDrawdownDependenceGraphProps> = ({ graphData }) => {
  const dispatch = useAppDispatch();
  const { ageMaxDrawdownDependenceLoadingStatus } = useSelector(
    (state: RootState) => state.portfolios,
  );

  const defaultColor = 'rgba(255, 99, 132, 0.2';
  const selectedColor = 'rgba(2, 110, 156, 1)';

  const [age, setAge] = useState(AGE_MIN);
  const [pointBackgroundColor, setPointBackgroundColor] = useState(
    graphData.map((_, index) => (index === 0 ? selectedColor : defaultColor)),
  );

  useEffect(() => {
    setPointBackgroundColor(
      graphData.map((_, index) => (index === 0 ? selectedColor : defaultColor)),
    );
    setAge(AGE_MIN);
  }, [graphData]);

  const syncRangeWithAge = (selectedAge: number) => {
    const idx = selectedAge - AGE_MIN;
    const point = graphData[idx];
    if (!point) return;

    dispatch(portfoliosActions.setPersonalMaxDrawdown(point.maxDrawdown));
    setAge(selectedAge);

    setPointBackgroundColor((prev) =>
      prev.map((_c, i) => (i + AGE_MIN === selectedAge ? selectedColor : defaultColor)),
    );
  };

  const handleAgeChange = (event: ChangeEvent<HTMLInputElement>) => {
    syncRangeWithAge(Number(event.target.value));
  };

  const chartData = {
    labels: graphData.map((d) => d.age),
    datasets: [
      {
        label: 'Max Drawdown',
        data: graphData.map((d) => d.maxDrawdown),
        fill: false,
        borderColor: defaultColor,
        pointBackgroundColor,
      },
    ],
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
      <Row>
        <Col>
          <div className="age-range">
            <Form.Label>Age: {age}</Form.Label>
            <Form.Range
              min={AGE_MIN}
              max={graphData.length + AGE_MIN - 1}
              value={age}
              onChange={handleAgeChange}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AgeMaxDrawdownDependenceGraph;
