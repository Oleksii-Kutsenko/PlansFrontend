import { useEffect, useState, type FC } from 'react';
import { Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import type { Portfolio, RootState, Ticker } from '../store';
import { portfoliosActions } from '../store';
import { useAppDispatch } from '../store/hooks';

interface PortfolioFilterFormInputs {
  personalMaxDrawdown: number | null;
  backtestStartDate: string;
}

const Portfolios: FC = () => {
  const dispatch = useAppDispatch();
  const { portfolios, portfoliosLoading, personalMaxDrawdown, personalMaxDrawdownLoading } =
    useSelector((state: RootState) => state.portfolios);

  const initialDate = new Date();
  initialDate.setFullYear(initialDate.getFullYear() - 15);
  const [backtestStartDate, setBacktestStartDate] = useState(initialDate);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm<PortfolioFilterFormInputs>();

  const setInitialValues = (): void => {
    setValue('personalMaxDrawdown', personalMaxDrawdown);
    setValue('backtestStartDate', backtestStartDate.toISOString().split('T')[0]);
  };

  const onSubmit = (data: PortfolioFilterFormInputs): void => {
    setBacktestStartDate(new Date(data.backtestStartDate));
    if (data.personalMaxDrawdown != null) {
      dispatch(portfoliosActions.setPersonalMaxDrawdown(data.personalMaxDrawdown));
    }
  };
  const onReset = (): void => {
    setBacktestStartDate(initialDate);
    dispatch(portfoliosActions.fetchPersonalMaxDrawdown()).catch((err) => {
      console.log(err);
    });
  };

  useEffect(() => {
    if (!portfoliosLoading && portfolios.length === 0) {
      dispatch(portfoliosActions.fetchPortfolios()).catch((err) => {
        console.log(err);
      });
    }
    if (!personalMaxDrawdownLoading && personalMaxDrawdown === null) {
      dispatch(portfoliosActions.fetchPersonalMaxDrawdown()).catch((err) => {
        console.log(err);
      });
    }
    setInitialValues();
  }, [dispatch, portfolios, portfoliosLoading, personalMaxDrawdown, personalMaxDrawdownLoading]);

  if (portfoliosLoading || personalMaxDrawdownLoading) {
    return <p>Loading...</p>;
  } else if (portfolios.length !== 0 && personalMaxDrawdown !== null) {
    return (
      <>
        <Container>
          <Row>
            <h1>Portfolios</h1>
          </Row>
          <Row>
            <Col xs={3}>
              <Form
                className="border border-secondary rounded m-3 p-3"
                style={{ backgroundColor: 'rgb(70, 130, 180)' }}
                onSubmit={handleSubmit(onSubmit)}>
                <Form.Group>
                  <Form.Label htmlFor="personalMaxDrawdown">Personal Max Drawdown</Form.Label>
                  <Form.Control
                    type="text"
                    id="personalMaxDrawdown"
                    {...register('personalMaxDrawdown')}></Form.Control>
                  {errors.personalMaxDrawdown != null && (
                    <Form.Control.Feedback type="invalid">
                      This field has error.
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Backtest Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    id="backtestStartDate"
                    {...register('backtestStartDate')}></Form.Control>
                  {errors.backtestStartDate != null && (
                    <Form.Control.Feedback type="invalid">
                      This field has error.
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <Form.Group className="d-flex justify-content-between">
                  <Button type="submit" className="mt-3 mr-auto">
                    Apply
                  </Button>
                  <Button type="reset" className="mt-3 ml-auto" onClick={onReset}>
                    Reset
                  </Button>
                </Form.Group>
              </Form>
            </Col>
            <Col xs={9}>
              {portfolios.map((portfolio: Portfolio) => {
                if (
                  portfolio.backtestData.maxDrawdown >= personalMaxDrawdown &&
                  new Date(portfolio.backtestData.startDate) <= backtestStartDate
                ) {
                  return (
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
                  );
                }
                return null;
              })}
            </Col>
          </Row>
        </Container>
      </>
    );
  } else {
    return <p>Something went wrong.</p>;
  }
};
export default Portfolios;
