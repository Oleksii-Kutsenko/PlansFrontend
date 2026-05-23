import './styles.css';

import type { FC } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';

import { type AgeMaxDrawdownDependency } from '@/store/api/portfoliosApi';

const AGE_MIN = 18;
const defaultColor = 'rgba(255, 99, 132, 0.2)';
const selectedColor = 'rgba(2, 110, 156, 1)';

interface Props {
  graphData: AgeMaxDrawdownDependency[];
  currentMaxDrawdown: number | null;
  onMaxDrawdownSelect: (md: number) => void;
}

const AgeMaxDrawdownDependenceGraph: FC<Props> = ({
  graphData,
  currentMaxDrawdown,
  onMaxDrawdownSelect,
}) => {
  const activeAge =
    graphData.find((dataPoint) => dataPoint.maxDrawdown === currentMaxDrawdown)?.age ?? AGE_MIN;

  const pointBackgroundColor = graphData.map((dataPoint) =>
    dataPoint.maxDrawdown === currentMaxDrawdown ? selectedColor : defaultColor,
  );

  const chartData = {
    labels: graphData.map((dataPoint) => dataPoint.age),
    datasets: [
      {
        label: 'Max Drawdown',
        data: graphData.map((dataPoint) => dataPoint.maxDrawdown),
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
          <Line data={chartData} height={'100%'} />
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="age-range">
            <Form.Label>Age: {activeAge}</Form.Label>
            <Form.Range
              min={AGE_MIN}
              max={graphData.length + AGE_MIN - 1}
              value={activeAge}
              onChange={(e) => {
                const point = graphData[Number(e.target.value) - AGE_MIN];
                if (point) onMaxDrawdownSelect(point.maxDrawdown);
              }}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AgeMaxDrawdownDependenceGraph;
