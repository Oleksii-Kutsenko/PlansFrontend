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
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { LoadStatus, portfoliosActions, type RootState } from '../../store';
import { useAppDispatch } from '../../store/hooks';
import AgeMaxDrawdownDependenceGraph from './AgeMaxDrawdownDependenceGraph/AgeMaxDrawdownDependenceGraph';
import { PersonalMaxDrawdownForm } from './PersonalMaxDrawdownForm';
import PortfolioList from './PortfolioList';
import { PortfolioFilterFormInputs } from './shared_interfaces';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Portfolios: FC = () => {
  const dispatch = useAppDispatch();
  const {
    backtestResults,
    backtestResultsLoadingStatus,
    personalMaxDrawdownLoadingStatus,
    ageMaxDrawdownDependence,
    ageMaxDrawdownDependenceLoadingStatus,
  } = useSelector((state: RootState) => state.portfolios);

  const [filters, setFilters] = useState<PortfolioFilterFormInputs | null>(null);

  useEffect(() => {
    const showError = (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Error fetching data: ${msg}`);
    };

    if (backtestResultsLoadingStatus === LoadStatus.IDLE) {
      void dispatch(portfoliosActions.fetchPortfolioBacktestResults()).unwrap().catch(showError);
    }

    if (ageMaxDrawdownDependenceLoadingStatus === LoadStatus.IDLE) {
      void dispatch(portfoliosActions.fetchAgeMaxDrawdownDependence(80)).unwrap().catch(showError);
    }

    if (personalMaxDrawdownLoadingStatus === LoadStatus.IDLE) {
      void dispatch(portfoliosActions.fetchPersonalMaxDrawdown()).unwrap().catch(showError);
    }
  }, [
    dispatch,
    backtestResultsLoadingStatus,
    ageMaxDrawdownDependenceLoadingStatus,
    personalMaxDrawdownLoadingStatus,
  ]);

  if (
    backtestResultsLoadingStatus === LoadStatus.LOADING ||
    personalMaxDrawdownLoadingStatus === LoadStatus.LOADING ||
    ageMaxDrawdownDependenceLoadingStatus === LoadStatus.LOADING
  ) {
    return <p>Loading...</p>;
  }

  if (
    backtestResultsLoadingStatus === LoadStatus.SUCCEEDED &&
    personalMaxDrawdownLoadingStatus === LoadStatus.SUCCEEDED &&
    ageMaxDrawdownDependenceLoadingStatus === LoadStatus.SUCCEEDED
  ) {
    return (
      <Container>
        <Row>
          <h1 className="text-center">Portfolios</h1>
        </Row>
        <Row>
          <Col xs={3} className="d-flex">
            <PersonalMaxDrawdownForm
              onApply={(v) => {
                setFilters(v);
              }}
            />
          </Col>
          <Col xs={9}>
            <AgeMaxDrawdownDependenceGraph graphData={ageMaxDrawdownDependence} />
          </Col>
        </Row>
        <PortfolioList backtestResults={backtestResults} filters={filters} />
      </Container>
    );
  }

  return <p>Something went wrong.</p>;
};

export default Portfolios;
