import type { FC } from 'react';
import { useEffect } from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  type RootState,
  type Portfolio as PortfolioType,
  type Ticker as TickerType,
  LoadStatus,
  portfoliosActions
} from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Portfolios: FC = () => {
  const dispatch = useAppDispatch();
  const {
    portfolios,
    portfoliosLoadingStatus,
    personalMaxDrawdown,
    personalMaxDrawdownLoadingStatus,
    ageMaxDrawdownDependence,
    ageMaxDrawdownDependenceLoadingStatus
  } = useSelector((state: RootState) => state.portfolios);

  const backtestStartDate = new Date();
  backtestStartDate.setFullYear(backtestStartDate.getFullYear() - 15);

  useEffect(() => {
    const fetchIfNeeded = (status: LoadStatus, action: AsyncThunk<any, void, any>) => {
      if (status === LoadStatus.IDLE || status === LoadStatus.FAILED) {
        dispatch(action()).catch((err: string | any) => {
          const errorMessage = err.message.toString() as string;
          toast.error(`Error fetching data: ${errorMessage}`);
        });
      }
    };

    fetchIfNeeded(portfoliosLoadingStatus, portfoliosActions.fetchPortfolios);
    fetchIfNeeded(
      ageMaxDrawdownDependenceLoadingStatus,
      portfoliosActions.fetchAgeMaxDrawdownDependence
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
      <>
        <h1 className="text-center">
          Portfolios
        </h1>
        <PersonalMaxDrawdownForm />
        <AgeMaxDrawdownDependenceGraph data={ageMaxDrawdownDependence} />
        <PortfolioList
          portfolios={portfolios}
          personalMaxDrawdown={personalMaxDrawdown}
          backtestStartDate={backtestStartDate}
        />
      </>
    )
  } else {
    return <p>Something went wrong.</p>;
  }
};

// TODO: Finish moving code from chat gtp, finish moving commented out code from below

  // let ageMaxDrawdownDependenceGraph = null;
  // if (ageMaxDrawdownDependenceLoadingStatus === LoadStatus.SUCCEEDED) {
  //   if (ageMaxDrawdownDependence != null) {
  //     const chartData = {
  //       labels: ageMaxDrawdownDependence[0],
  //       datasets: [
  //         {
  //           label: 'Max Drawdown',
  //           data: ageMaxDrawdownDependence[1],
  //           fill: false,
  //           backgroundColor: 'rgb(255, 99, 132)',
  //           borderColor: 'rgba(255, 99, 132, 0.2)'
  //         }
  //       ]
  //     };

  //     ageMaxDrawdownDependenceGraph = (
  //       <Col xs={9}>
  //         <Line data={chartData} />
  //       </Col>
  //     );
  //   } else {
  //     ageMaxDrawdownDependenceGraph = (
  //       <Col xs={9}>
  //         <p>Failed to load age max drawdown dependence data.</p>
  //       </Col>
  //     );
  //   }
  // } else if (ageMaxDrawdownDependenceLoadingStatus === LoadStatus.LOADING) {
  //   ageMaxDrawdownDependenceGraph = (
  //     <Col xs={9}>
  //       <p>Loading...</p>
  //     </Col>
  //   );
  // } else if (ageMaxDrawdownDependenceLoadingStatus === LoadStatus.FAILED) {
  //   ageMaxDrawdownDependenceGraph = (
  //     <Col xs={9}>
  //       <p>Failed to load age max drawdown dependence data.</p>
  //     </Col>
  //   );
  // } else {
  //   ageMaxDrawdownDependenceGraph = (
  //     <Col xs={9}>
  //       <p>Unknown error.</p>
  //     </Col>
  //   );
  // }

  // if (
  //   portfoliosLoadingStatus === LoadStatus.LOADING ||
  //   personalMaxDrawdownLoadingStatus === LoadStatus.LOADING ||
  //   ageMaxDrawdownDependenceLoadingStatus === LoadStatus.LOADING
  // ) {
  //   return <p>Loading...</p>;
  // } else if (
  //   portfoliosLoadingStatus === LoadStatus.SUCCEEDED &&
  //   personalMaxDrawdownLoadingStatus === LoadStatus.SUCCEEDED
  // ) {
  //   if (!personalMaxDrawdown) {
  //     return <p>Failed to load personal max drawdown.</p>;
  //   }
  //   return (
  //     <>
  //       <Container>
  //         <Row>
  //           <Col xs={12}>
  //             <h1 className='text-center'>Portfolios</h1>
  //           </Col>
  //         </Row>
  //         <Row>
  //           <Col xs={3}>
  //             <PersonalMaxDrawdownForm />
  //           </Col>
  //           <Col xs={9}>{ageMaxDrawdownDependenceGraph}</Col>
  //         </Row>
  //         <Row>
  //           <Col xs={12}>
  //             {portfolios.map((portfolio: PortfolioType) => {
  //               if (
  //                 portfolio.backtestData.maxDrawdown >= personalMaxDrawdown &&
  //                 new Date(portfolio.backtestData.startDate) <= backtestStartDate
  //               ) {
  //                 return (
  //                   <Card key={portfolio.name} className='m-3'>
  //                     <Card.Header style={{ backgroundColor: 'pink' }}>
  //                       <h4>{portfolio.name}</h4>
  //                     </Card.Header>
  //                     <Card.Body>
  //                       <Container>
  //                         <Row>
  //                           <Col xs={6}>
  //                             <h5>Backtest Data</h5>
  //                             <p>CAGR: {portfolio.backtestData.cagr}%</p>
  //                             <p>Max Drawdown: {portfolio.backtestData.maxDrawdown}%</p>
  //                             <p>Sharpe: {portfolio.backtestData.sharpe}</p>
  //                             <p>Standard Deviation: {portfolio.backtestData.standardDeviation}</p>
  //                             <p>Start Date: {portfolio.backtestData.startDate}</p>
  //                           </Col>
  //                           <Col xs={6}>
  //                             <h5>Constituents</h5>
  //                             <Table>
  //                               <thead>
  //                                 <tr>
  //                                   <th>Symbol</th>
  //                                   <th>Name</th>
  //                                   <th>Weight</th>
  //                                 </tr>
  //                               </thead>
  //                               <tbody>
  //                                 {portfolio.tickers.map((ticker: TickerType) => (
  //                                   <tr key={ticker.symbol}>
  //                                     <td>{ticker.symbol}</td>
  //                                     <td>{ticker.name}</td>
  //                                     <td>{ticker.weight}</td>
  //                                   </tr>
  //                                 ))}
  //                               </tbody>
  //                             </Table>
  //                           </Col>
  //                         </Row>
  //                       </Container>
  //                     </Card.Body>
  //                   </Card>
  //                 );
  //               }
  //               return null;
  //             })}
  //           </Col>
  //         </Row>
  //       </Container>
  //     </>
  //   );
  // } else {
  //   return <p>Something went wrong.</p>;
  // }


export default Portfolios;
