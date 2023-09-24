import { FC } from 'react';
import { LoadStatus, Portfolio, RootState } from '../../store';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { type Portfolio as PortfolioType, type Ticker as TickerType } from '../../store';

const PortfolioList: FC<{
  portfolios: Portfolio[];
  personalMaxDrawdown: number | null;
  backtestStartDate: Date;
}> = ({ portfolios, personalMaxDrawdown, backtestStartDate }) => {
  const { portfoliosLoadingStatus } = useSelector((state: RootState) => state.portfolios);

  if (portfoliosLoadingStatus === LoadStatus.LOADING) {
    return <p>Loading...</p>;
  } else if (portfoliosLoadingStatus === LoadStatus.SUCCEEDED && personalMaxDrawdown) {
    return (
      <Row>
        <Col xs={12}>
          {portfolios.map((portfolio: PortfolioType) => {
            if (
              portfolio.backtestData.maxDrawdown >= personalMaxDrawdown &&
              new Date(portfolio.backtestData.startDate) <= backtestStartDate
            ) {
              return (
                <Card key={portfolio.name} className='m-3'>
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
                              {portfolio.tickers.map((ticker: TickerType) => (
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
              );
            }
            return null;
          })}
        </Col>
      </Row>
    );
  } else {
    return <p>Something went wrong.</p>;
  }
};

export default PortfolioList;
