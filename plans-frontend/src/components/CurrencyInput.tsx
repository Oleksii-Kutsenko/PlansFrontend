import { ChangeEvent, FC, useState } from 'react';

interface Props {
  value: number | undefined;
  updateValue: (value: number | undefined) => void;
}

const stringToNumber = (value: string): number => parseInt(value.replace(/\./g, ''), 10);
const format = (value: number): string => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
// Continue from here, create good currency input component
export const CurrencyInput: FC<Props> = ({ value: valueFromProp, updateValue }) => {
  const [currentValue, updateCurrentValue] = useState<number | undefined>(
    valueFromProp ? valueFromProp : undefined
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const {
      target: { value }
    } = event;

    if (value === '') {
      updateCurrentValue(undefined);
      return updateValue(undefined);
    }

    const valueAsNumber = stringToNumber(value);

    updateCurrentValue(format(valueAsNumber));
    return updateValue(valueAsNumber);
  };

  return (
    <input
      type='number'
      className='form-control'
      value={currentValue}
      onChange={handleChange}
      min={0}
    />
  );
};
