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
import { Col, Container, Row, Spinner } from 'react-bootstrap';

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
    const date = new Date();
    date.setFullYear(date.getFullYear() - 15);
    return date.toISOString().split('T')[0];
  }, []);

  if (isLoading || isPersonalMaxDrawdownLoading || isAgeMaxDrawdownLoading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
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

  if (ageMaxDrawdownDependence) {
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
  }
};

export default Portfolios;
