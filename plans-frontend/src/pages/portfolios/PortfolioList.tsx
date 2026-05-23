import { FC, useMemo } from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';

import {
  BacktestResults,
  type Ticker as TickerType,
  useFetchPortfolioBacktestResultsQuery,
} from '@/store/api/portfoliosApi';

import { PortfolioFilterFormInputs } from './sharedInterfaces';

const PortfolioList: FC<{
  backtestResults: BacktestResults[];
  filters: PortfolioFilterFormInputs | null;
}> = ({ backtestResults, filters }) => {
  const { isLoading: isBacktestResultsLoading, isError: isBacktestResultsError } =
    useFetchPortfolioBacktestResultsQuery();

  const toBeRenderedPortfolios = useMemo(() => {
    const md = filters?.personalMaxDrawdown;
    const start = filters?.backtestStartDate;
    const results = backtestResults;
    if (md == null || start == null) {
      return results.slice(0, 10);
    }
    const startDate = new Date(start);
    return results
      .filter((r) => r.maxDrawdown >= md && new Date(r.startDate) <= startDate)
      .slice(0, 10);
  }, [backtestResults, filters]);

  if (isBacktestResultsLoading) return <p>Loading...</p>;

  if (isBacktestResultsError) return <p>Something went wrong.</p>;

  return toBeRenderedPortfolios.length > 0 ? (
    <Row>
      <Col xs={12}>
        {toBeRenderedPortfolios.map((backtestResults: BacktestResults) => {
          return (
            <Card key={backtestResults.id} className="m-3">
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
                      <p>TWR: {backtestResults.twrAnnual}%</p>
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
  ) : (
    <p>Portfolios did not pass the filters.</p>
  );
};

export default PortfolioList;
