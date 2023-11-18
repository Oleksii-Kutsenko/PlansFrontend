import { FC } from 'react';
import { CurrencyInput } from './CurrencyInput';

interface Props {
  value: number | null;
  onSubmit?: (value: number) => Promise<void>;
}

export const PercentageInput: FC<Props> = ({ value, onSubmit }) => {
  return <CurrencyInput symbol='%' value={value} onSubmit={onSubmit} />;
};
