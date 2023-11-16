import { ChangeEvent, FC, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { PayloadAction } from '@reduxjs/toolkit';

interface Props {
  symbol: string;
  value: number | null;
  onSubmit?: (value: number) => Promise<void>;
}

export const CurrencyInput: FC<Props> = ({ symbol, value, onSubmit }) => {
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(true);
  const [currentValue, updateCurrentValue] = useState<number>(value ? value : 0);
  let previousValue = value ? value : 0;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const {
      target: { value }
    } = event;

    let money;
    if (value === '') {
      money = 0;
    } else {
      money = parseFloat(value);
    }

    if (money < 0) {
      toast.error('Money value cannot be negative');
      money = 0;
    }

    previousValue = money;
    updateCurrentValue(money);
  };

  const handleEdit = (): void => {
    setIsInputDisabled(!isInputDisabled);
  };

  const handleSubmit = (): void => {
    setIsInputDisabled(true);
    if (onSubmit) {
      onSubmit(currentValue).catch((err) => {
        console.log(err);
        toast.error('Failed to update value');
        updateCurrentValue(previousValue);
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <InputGroup className=''>
      <InputGroup.Text>{symbol}</InputGroup.Text>
      <Form.Control
        style={{ textAlign: 'left', fontSize: '0.95rem' }}
        id='currency-input'
        disabled={isInputDisabled}
        aria-label='Amount'
        onChange={handleChange}
        type='number'
        value={currentValue}
        min='0'
        onKeyDown={handleKeyDown}
      />
      <Button variant='outline-secondary' id='edit-button' onClick={handleEdit}>
        <i className='bi bi-pencil'></i>
      </Button>
      <Button variant='outline-secondary' id='submit-button' onClick={handleSubmit}>
        <i className='bi bi-check'></i>
      </Button>
    </InputGroup>
  );
};
