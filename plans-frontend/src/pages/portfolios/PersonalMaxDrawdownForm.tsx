import { useEffect, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { LoadStatus, portfoliosActions, type RootState } from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { type PortfolioFilterFormInputs } from './shared_interfaces';

interface Props {
  onApply: (values: PortfolioFilterFormInputs) => void;
}

const toDateInputValue = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const PersonalMaxDrawdownForm = ({ onApply }: Props) => {
  const dispatch = useAppDispatch();
  const { personalMaxDrawdown, personalMaxDrawdownLoadingStatus } = useSelector(
    (state: RootState) => state.portfolios
  );

  const defaultBacktestStartDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 15);
    return toDateInputValue(d);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PortfolioFilterFormInputs>({
    defaultValues: {
      personalMaxDrawdown: personalMaxDrawdown ?? null,
      backtestStartDate: defaultBacktestStartDate
    }
  });

  useEffect(() => {
    if (personalMaxDrawdownLoadingStatus !== LoadStatus.LOADING && personalMaxDrawdown === null) {
      void dispatch(portfoliosActions.fetchPersonalMaxDrawdown())
        .unwrap()
        .catch((error: unknown) => {
          const msg = error instanceof Error ? error.message : String(error);
          toast.error(`Error fetching personal max drawdown: ${msg}`);
        });
    }
  }, [dispatch, personalMaxDrawdown, personalMaxDrawdownLoadingStatus]);

  useEffect(() => {
    reset({
      personalMaxDrawdown: personalMaxDrawdown ?? null,
      backtestStartDate: defaultBacktestStartDate
    });
  }, [personalMaxDrawdown, reset, defaultBacktestStartDate]);

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
      backtestStartDate: defaultBacktestStartDate
    };

    reset(resetValues);
    onApply(resetValues);

    void dispatch(portfoliosActions.fetchPersonalMaxDrawdown())
      .unwrap()
      .catch((error: unknown) => {
        const msg = error instanceof Error ? error.message : String(error);
        toast.error(`Error fetching personal max drawdown: ${msg}`);
      });
  };

  if (personalMaxDrawdownLoadingStatus === LoadStatus.LOADING) return <div>Loading...</div>;
  if (personalMaxDrawdown == null) return <div>Personal max drawdown not found.</div>;

  return (
    <div className='my-auto'>
      <Form
        className='border border-secondary rounded m-3 p-3'
        style={{ backgroundColor: 'rgb(70, 130, 180)' }}
        onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
      >
        <Form.Group>
          <Form.Label htmlFor='personalMaxDrawdown'>Personal Max Drawdown</Form.Label>
          <Form.Control
            type='number'
            id='personalMaxDrawdown'
            step='0.01'
            inputMode='decimal'
            {...register('personalMaxDrawdown', {
              // empty => null, otherwise number
              setValueAs: (v) => (v === '' || v == null ? null : Number(v))
            })}
            isInvalid={errors.personalMaxDrawdown != null}
          />
          <Form.Control.Feedback type='invalid'>This field has an error.</Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
          <Form.Label htmlFor='backtestStartDate'>Backtest Start Date</Form.Label>
          <Form.Control
            type='date'
            id='backtestStartDate'
            {...register('backtestStartDate', { required: true })}
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
};
