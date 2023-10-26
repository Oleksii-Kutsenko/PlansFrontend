import type { FC } from 'react';
import { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { type RootState, LoadStatus, portfoliosActions } from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { PersonalMaxDrawdownForm } from './PersonalMaxDrawdownForm';
import type { AsyncThunk } from '@reduxjs/toolkit';
import AgeMaxDrawdownDependenceGraph from './AgeMaxDrawdownDependenceGraph/AgeMaxDrawdownDependenceGraph';
import PortfolioList from './PortfolioList';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Portfolios: FC = () => {
  const dispatch = useAppDispatch();
  const {
    portfolios,
    portfoliosLoadingStatus,
    personalMaxDrawdownLoadingStatus,
    ageMaxDrawdownDependence,
    ageMaxDrawdownDependenceLoadingStatus
  } = useSelector((state: RootState) => state.portfolios);

  useEffect(() => {
    const fetchIfNeeded = (
      status: LoadStatus,
      action: AsyncThunk<any, any, any>,
      args: any | null = null
    ) => {
      if (status === LoadStatus.IDLE || status === LoadStatus.FAILED) {
        dispatch(action(args)).catch((err: string | any) => {
          const errorMessage = err.message.toString() as string;
          toast.error(`Error fetching data: ${errorMessage}`);
        });
      }
    };

    fetchIfNeeded(portfoliosLoadingStatus, portfoliosActions.fetchPortfolios);
    fetchIfNeeded(
      ageMaxDrawdownDependenceLoadingStatus,
      portfoliosActions.fetchAgeMaxDrawdownDependence,
      80
    );
    fetchIfNeeded(personalMaxDrawdownLoadingStatus, portfoliosActions.fetchPersonalMaxDrawdown);
  }, [
    dispatch,
    portfoliosLoadingStatus,
    ageMaxDrawdownDependenceLoadingStatus,
    personalMaxDrawdownLoadingStatus
  ]);

  if (
    portfoliosLoadingStatus === LoadStatus.LOADING ||
    personalMaxDrawdownLoadingStatus === LoadStatus.LOADING ||
    ageMaxDrawdownDependenceLoadingStatus === LoadStatus.LOADING
  ) {
    return <p>Loading...</p>;
  } else if (
    portfoliosLoadingStatus === LoadStatus.SUCCEEDED &&
    personalMaxDrawdownLoadingStatus === LoadStatus.SUCCEEDED &&
    ageMaxDrawdownDependenceLoadingStatus === LoadStatus.SUCCEEDED
  ) {
    return (
      <Container>
        <Row>
          <h1 className='text-center'>Portfolios</h1>
        </Row>
        <Row>
          <Col xs={3} className='d-flex'>
            <PersonalMaxDrawdownForm />
          </Col>
          <Col xs={9}>
            <AgeMaxDrawdownDependenceGraph graphData={ageMaxDrawdownDependence} />
          </Col>
        </Row>
        <PortfolioList portfolios={portfolios} />
      </Container>
    );
  } else {
    return <p>Something went wrong.</p>;
  }
};

export default Portfolios;
