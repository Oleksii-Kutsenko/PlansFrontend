import { useEffect, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { type RootState, portfoliosActions, LoadStatus } from '../../store';
import { useAppDispatch } from '../../store/hooks';

interface PortfolioFilterFormInputs {
  personalMaxDrawdown: number | null;
  backtestStartDate: Date;
}

type Props = {
  onApply: (values: PortfolioFilterFormInputs) => void;
};

export const PersonalMaxDrawdownForm = ({ onApply }: Props) => {
  const dispatch = useAppDispatch();
  const { personalMaxDrawdown, personalMaxDrawdownLoadingStatus } = useSelector(
    (state: RootState) => state.portfolios
  );

  const defaultBacktestStartDateStr = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 15);
    return d.toISOString().slice(0, 10);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PortfolioFilterFormInputs>({
    defaultValues: {
      personalMaxDrawdown: personalMaxDrawdown ?? null,
      backtestStartDate: defaultBacktestStartDateStr
    }
  });

  useEffect(() => {
    if (personalMaxDrawdownLoadingStatus !== LoadStatus.LOADING && personalMaxDrawdown === null) {
      dispatch(portfoliosActions.fetchPersonalMaxDrawdown()).catch((err) => {
        toast.error('Error fetching personal max drawdown: ' + String(err?.message ?? err));
      });
    }
  }, [dispatch, personalMaxDrawdown, personalMaxDrawdownLoadingStatus]);

  useEffect(() => {
    reset({
      personalMaxDrawdown: personalMaxDrawdown ?? null,
      backtestStartDate: defaultBacktestStartDateStr
    });
  }, [personalMaxDrawdown, reset, defaultBacktestStartDateStr]);

  const handleFormSubmit = (formData: PortfolioFilterFormInputs): void => {
    onApply(formData);

    const md = formData.personalMaxDrawdown;
    if (md != null && Number.isFinite(md)) {
      const rounded = Number(md.toFixed(2));
      dispatch(portfoliosActions.setPersonalMaxDrawdown(rounded));
    }
  };

  const handleFormReset = (): void => {
    const resetValues: PortfolioFilterFormInputs = {
      personalMaxDrawdown: personalMaxDrawdown ?? null,
      backtestStartDate: defaultBacktestStartDateStr
    };

    reset(resetValues);
    onApply(resetValues);

    dispatch(portfoliosActions.fetchPersonalMaxDrawdown()).catch((err) => {
      toast.error('Error fetching personal max drawdown: ' + String(err?.message ?? err));
    });
  };

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
              type='number'
              id='personalMaxDrawdown'
              step='0.01'
              inputMode='decimal'
              {...register('personalMaxDrawdown', { valueAsNumber: true })}
              isInvalid={errors.personalMaxDrawdown != null}
            />
            <Form.Control.Feedback type='invalid'>This field has an error.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='backtestStartDate'>Backtest Start Date</Form.Label>
            <Form.Control
              type='date'
              id='backtestStartDate'
              {...register('backtestStartDate', { required: true, valueAsDate: true })}
              isInvalid={errors.backtestStartDate != null}
            />
            <Form.Control.Feedback type='invalid'>This field has an error.</Form.Control.Feedback>
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
