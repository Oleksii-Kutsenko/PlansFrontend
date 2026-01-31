import { FC, useEffect, useState } from 'react';
import { LoadStatus, BacktestResults, RootState } from '../../store';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { type Ticker as TickerType } from '../../store';

const PortfolioList: FC<{
  backtestResults: BacktestResults[];
  filters: PortfolioFilterFormInputs;
}> = ({ backtestResults, filters }) => {
  const { backtestResultsLoadingStatus: backtestResultsLoadingStatus } = useSelector(
    (state: RootState) => state.portfolios
  );
  const [toBeRenderedPortfolios, setToBeRenderedPortfolios] = useState<BacktestResults[]>([]);

  useEffect(() => {
    if (filters && filters.personalMaxDrawdown !== null) {
      const filteredPortfolios = backtestResults.results.filter(
        (backtestResult: BacktestResults) => {
          return (
            backtestResult.maxDrawdown >= filters.personalMaxDrawdown &&
            new Date(backtestResult.startDate) <= filters.backtestStartDate
          );
        }
      );
      setToBeRenderedPortfolios(filteredPortfolios.slice(0, 10));
    }
  }, [backtestResults, filters]);

  if (backtestResultsLoadingStatus === LoadStatus.LOADING) {
    return <p>Loading...</p>;
  } else if (
    backtestResultsLoadingStatus === LoadStatus.SUCCEEDED &&
    toBeRenderedPortfolios.length > 0
  ) {
    return (
      <Row>
        <Col xs={12}>
          {toBeRenderedPortfolios.map((backtestResults: BacktestResults) => {
            return (
              <Card key={backtestResults.portfolio.name} className='m-3'>
                <Card.Header style={{ backgroundColor: 'pink' }}>
                  <h4>
                    {backtestResults.portfolio.name} / {backtestResults.strategy}
                  </h4>
                </Card.Header>
                <Card.Body>
                  <Container>
                    <Row>
                      <Col xs={6}>
                        <h5>Backtest Data</h5>
                        <p>CAGR: {backtestResults.cagr}%</p>
                        <p>Max Drawdown: {backtestResults.maxDrawdown}%</p>
                        <p>Sharpe: {backtestResults.sharpe}</p>
                        <p>Standard Deviation: {backtestResults.standardDeviation}</p>
                        <p>Start Date: {backtestResults.startDate}</p>
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
                            {backtestResults.portfolio.tickers.map((ticker: TickerType) => (
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
          })}
        </Col>
      </Row>
    );
  } else if (backtestResultsLoadingStatus === LoadStatus.SUCCEEDED) {
    return <p>Portfolios did not pass the filters.</p>;
  } else {
    return <p>Something went wrong.</p>;
  }
};

export default PortfolioList;
