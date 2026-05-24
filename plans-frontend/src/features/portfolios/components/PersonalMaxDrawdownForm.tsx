import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import { type PortfolioFilterFormInputs } from '../utils/sharedInterfaces';

interface Props {
  activeFilters: PortfolioFilterFormInputs;
  onApply: (values: PortfolioFilterFormInputs) => void;
  onReset: () => void;
}

export const PersonalMaxDrawdownForm = ({ activeFilters, onApply, onReset }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortfolioFilterFormInputs>({
    values: activeFilters,
  });

  return (
    <div className="my-auto">
      <Form
        className="border border-secondary rounded m-3 p-3"
        style={{ backgroundColor: 'rgb(70, 130, 180)' }}
        onSubmit={(e) => void handleSubmit(onApply)(e)}
      >
        <Form.Group>
          <Form.Label htmlFor="personalMaxDrawdown">Personal Max Drawdown</Form.Label>
          <Form.Control
            type="number"
            id="personalMaxDrawdown"
            step="0.01"
            inputMode="decimal"
            {...register('personalMaxDrawdown', {
              setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
            })}
            isInvalid={errors.personalMaxDrawdown != null}
          />
          <Form.Control.Feedback type="invalid">This field has an error.</Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
          <Form.Label htmlFor="backtestStartDate">Backtest Start Date</Form.Label>
          <Form.Control
            type="date"
            id="backtestStartDate"
            {...register('backtestStartDate', { required: true })}
            isInvalid={errors.backtestStartDate != null}
          />
          <Form.Control.Feedback type="invalid">This field has an error.</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="d-flex justify-content-between">
          <Button type="submit" className="mt-3 mr-auto">
            Apply
          </Button>
          <Button type="button" className="mt-3 ml-auto" onClick={onReset}>
            Reset
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};
