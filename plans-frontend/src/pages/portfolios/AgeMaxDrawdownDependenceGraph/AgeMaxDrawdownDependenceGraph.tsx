import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LoadStatus, RootState } from '../../../store';
import { Line } from 'react-chartjs-2';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { portfoliosActions, AgeMaxDrawdownDependency } from '../../../store';
import { useAppDispatch } from '../../../store/hooks';
import './styles.css';
const AGE_MIN = 18;
type AgeMaxDrawdownDependenceGraphProps = {
  graphData: AgeMaxDrawdownDependency[];
};

const AgeMaxDrawdownDependenceGraph: FC<AgeMaxDrawdownDependenceGraphProps> = ({ graphData }) => {
  const dispatch = useAppDispatch();
  const { ageMaxDrawdownDependenceLoadingStatus } = useSelector(
    (state: RootState) => state.portfolios
  );

  const defaultColor = 'rgba(255, 99, 132, 0.2';
  const selectedColor = 'rgba(2, 110, 156, 1)';

  const [age, setAge] = useState(AGE_MIN);
  const [pointBackgroundColor, setPointBackgroundColor] = useState(
    graphData.map((_, index) => (index === 0 ? selectedColor : defaultColor))
  );

  useEffect(() => {
    syncRangeWithAge(age);
  }, [graphData]);

  function syncRangeWithAge(selectedAge: number) {
    const dataAge = selectedAge - AGE_MIN;
    dispatch(portfoliosActions.setPersonalMaxDrawdown(graphData[dataAge].maxDrawdown));
    setAge(selectedAge);
    setPointBackgroundColor(
      pointBackgroundColor.map((_color, index) =>
        index + AGE_MIN === selectedAge ? selectedColor : defaultColor
      )
    );
  }

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedAge = Number(event.target.value);
    syncRangeWithAge(selectedAge);
  };

  const chartLabels = graphData.map((data) => data.age);
  const chartDataPoints = graphData.map((data) => data.maxDrawdown);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Max Drawdown',
        data: chartDataPoints,
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
      <Row>
        <Col>
          <div className='age-range'>
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
