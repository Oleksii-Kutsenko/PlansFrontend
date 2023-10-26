import { useEffect, type FC, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { type RootState, portfoliosActions, LoadStatus } from '../../store';
import { useAppDispatch } from '../../store/hooks';

interface PortfolioFilterFormInputs {
  personalMaxDrawdown: number | null;
  backtestStartDate: string;
}

export const PersonalMaxDrawdownForm: FC = () => {
  const dispatch = useAppDispatch();
  const { personalMaxDrawdown, personalMaxDrawdownLoadingStatus } = useSelector(
    (state: RootState) => state.portfolios
  );

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm<PortfolioFilterFormInputs>();

  const setInitialFormValues = (): void => {
    setValue('personalMaxDrawdown', personalMaxDrawdown);
    setValue('backtestStartDate', backtestStartDate.toISOString().split('T')[0]);
  };

  const defaultBacktestStartDate = new Date();
  defaultBacktestStartDate.setFullYear(defaultBacktestStartDate.getFullYear() - 15);
  const [backtestStartDate, setBacktestStartDate] = useState<Date>(defaultBacktestStartDate);

  const handleFormSubmit = (formData: PortfolioFilterFormInputs): void => {
    setBacktestStartDate(new Date(formData.backtestStartDate));
    if (formData.personalMaxDrawdown != null) {
      dispatch(portfoliosActions.setPersonalMaxDrawdown(formData.personalMaxDrawdown));
    }
  };

  const handleFormReset = (): void => {
    setBacktestStartDate(defaultBacktestStartDate);
    dispatch(portfoliosActions.fetchPersonalMaxDrawdown()).catch((err) => {
      const errorMessage = err.message.toString() as string;
      toast.error('Error fetching personal max drawdown: ' + errorMessage);
    });
  };

  useEffect(() => {
    if (!personalMaxDrawdownLoadingStatus && personalMaxDrawdown === null) {
      dispatch(portfoliosActions.fetchPersonalMaxDrawdown()).catch((err) => {
        const errorMessage = err.message.toString() as string;
        toast.error('Error fetching personal max drawdown: ' + errorMessage);
      });
    }

    setInitialFormValues();
  }, [personalMaxDrawdown]);

  if (personalMaxDrawdownLoadingStatus === LoadStatus.LOADING) {
    return <div>Loading...</div>;
  } else if (personalMaxDrawdown == null) {
    return <div>Personal max drawdown not found.</div>;
  } else {
    return (
      <div className='my-auto'>
        <Form
          className='border border-secondary rounded m-3 p-3'
          style={{ backgroundColor: 'rgb(70, 130, 180)' }}
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <Form.Group>
            <Form.Label htmlFor='personalMaxDrawdown'>Personal Max Drawdown</Form.Label>
            <Form.Control
              type='text'
              id='personalMaxDrawdown'
              {...register('personalMaxDrawdown')}
            />
            {errors.personalMaxDrawdown != null && (
              <Form.Control.Feedback type='invalid'>This field has an error.</Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>Backtest Start Date</Form.Label>
            <Form.Control type='date' id='backtestStartDate' {...register('backtestStartDate')} />
            {errors.backtestStartDate != null && (
              <Form.Control.Feedback type='invalid'>This field has an error.</Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group className='d-flex justify-content-between'>
            <Button type='submit' className='mt-3 mr-auto'>
              Apply
            </Button>
            <Button type='reset' className='mt-3 ml-auto' onClick={handleFormReset}>
              Reset
            </Button>
          </Form.Group>
        </Form>
      </div>
    );
  }
};
