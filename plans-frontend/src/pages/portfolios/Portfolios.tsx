import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import {
  useFetchAgeMaxDrawdownDependenceQuery,
  useFetchPersonalMaxDrawdownQuery,
  useFetchPortfolioBacktestResultsQuery,
} from '@/store/api/portfoliosApi';

import AgeMaxDrawdownDependenceGraph from './AgeMaxDrawdownDependenceGraph/AgeMaxDrawdownDependenceGraph';
import { PersonalMaxDrawdownForm } from './PersonalMaxDrawdownForm';
import PortfolioList from './PortfolioList';
import { PortfolioFilterFormInputs } from './sharedInterfaces';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Portfolios: FC = () => {
  const { data: backtestResults, isLoading, isError } = useFetchPortfolioBacktestResultsQuery();
  const {
    data: personalMaxDrawdown,
    isLoading: isPersonalMaxDrawdownLoading,
    isError: isPersonalMaxDrawdownError,
    refetch: refetchMaxDrawdown,
  } = useFetchPersonalMaxDrawdownQuery();
  const {
    data: ageMaxDrawdownDependence,
    isLoading: isAgeMaxDrawdownLoading,
    isError: isAgeMaxDrawdownError,
  } = useFetchAgeMaxDrawdownDependenceQuery();

  const [filters, setFilters] = useState<PortfolioFilterFormInputs | null>(null);

  const defaultBacktestStartDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 15);
    return d.toISOString().split('T')[0];
  }, []);

  if (isLoading || isPersonalMaxDrawdownLoading || isAgeMaxDrawdownLoading) {
    return <p>Loading...</p>;
  }

  if (isError || isPersonalMaxDrawdownError || isAgeMaxDrawdownError) {
    return <p>Something went wrong.</p>;
  }

  const activeFilters: PortfolioFilterFormInputs = filters ?? {
    personalMaxDrawdown: personalMaxDrawdown ?? null,
    backtestStartDate: defaultBacktestStartDate,
  };

  const handleReset = () => {
    setFilters(null);
    void refetchMaxDrawdown();
  };

  return (
    <Container>
      <Row>
        <h1 className="text-center">Portfolios</h1>
      </Row>
      <Row>
        <Col xs={3} className="d-flex">
          <PersonalMaxDrawdownForm
            activeFilters={activeFilters}
            onApply={setFilters}
            onReset={handleReset}
          />
        </Col>
        <Col xs={9}>
          <AgeMaxDrawdownDependenceGraph
            graphData={ageMaxDrawdownDependence}
            currentMaxDrawdown={activeFilters.personalMaxDrawdown}
            onMaxDrawdownSelect={(md) => {
              setFilters({ ...activeFilters, personalMaxDrawdown: md });
            }}
          />
        </Col>
      </Row>
      <PortfolioList backtestResults={backtestResults ?? []} filters={activeFilters} />
    </Container>
  );
};

export default Portfolios;
