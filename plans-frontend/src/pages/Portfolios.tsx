import { useEffect, type FC } from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { fetchPersonalMaxDrawdown, fetchPortfolios } from '../store';
import type { Portfolio, RootState, Ticker } from '../store';
import { useAppDispatch } from '../store/hooks';

const Portfolios: FC = () => {
  const dispatch = useAppDispatch();
  const { portfolios, portfoliosLoading, personalMaxDrawdown, personalMaxDrawdownLoading } =
    useSelector((state: RootState) => state.portfolios);

  useEffect(() => {
    if (!portfoliosLoading && portfolios.length === 0) {
      dispatch(fetchPortfolios()).catch((err) => {
        console.log(err);
      });
    }
    if (!personalMaxDrawdownLoading && personalMaxDrawdown === null) {
      dispatch(fetchPersonalMaxDrawdown()).catch((err) => {
        console.log(err);
      });
    }
  }, [dispatch, portfolios, portfoliosLoading, personalMaxDrawdown, personalMaxDrawdownLoading]);
  console.log(portfolios, portfoliosLoading);
  console.log(personalMaxDrawdown, personalMaxDrawdownLoading);
  return (
    <>
      <Container>
        <Row>
          <h1>Portfolios</h1>
        </Row>
        <Row>
          <Col xs={3}>
            <Card className="m-3">
              <Card.Header>
                <h4>Personal Max Drawdown</h4>
              </Card.Header>
              <Card.Body></Card.Body>
            </Card>
          </Col>
          <Col xs={9}>
            {portfolios.map((portfolio: Portfolio) => (
              <Card key={portfolio.name} className="m-3">
                <Card.Header style={{ backgroundColor: 'pink' }}>
                  <h4>{portfolio.name}</h4>
                </Card.Header>
                <Card.Body>
                  <Container>
                    <Row>
                      <Col xs={6}>
                        <h5>Backtest Data</h5>
                        <p>CAGR: {portfolio.backtestData.cagr}%</p>
                        <p>Max Drawdown: {portfolio.backtestData.maxDrawdown}%</p>
                        <p>Sharpe: {portfolio.backtestData.sharpe}</p>
                        <p>Standard Deviation: {portfolio.backtestData.standardDeviation}</p>
                        <p>Start Date: {portfolio.backtestData.startDate}</p>
                      </Col>
                      <Col xs={6}>
                        <h5>Constituents</h5>
                        <Table>
                          <thead>
                            <tr>
                              <th>Symbol</th>
                              <th>Name</th>
                              <th>Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {portfolio.tickers.map((ticker: Ticker) => (
                              <tr key={ticker.symbol}>
                                <td>{ticker.symbol}</td>
                                <td>{ticker.name}</td>
                                <td>{ticker.weight}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  </Container>
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default Portfolios;
