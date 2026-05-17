import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';

interface Props {
  symbol: string;
  value: number | null;
  onSubmit?: (value: number) => Promise<void>;
}

export const CurrencyInput: FC<Props> = ({ symbol, value, onSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(true);
  const [currentValue, updateCurrentValue] = useState<number>(value ?? 0);
  const previousValueRef = useRef<number>(value ?? 0);

  useEffect(() => {
    updateCurrentValue(value ?? 0);
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const {
      target: { value: targetValue },
    } = event;

    let money = 0;
    if (targetValue !== '') {
      money = Number.parseFloat(targetValue);
    }

    if (money < 0) {
      toast.error('Money value cannot be negative');
      money = 0;
    }

    updateCurrentValue(money);
  };

  const handleEdit = (): void => {
    previousValueRef.current = currentValue;
    setIsInputDisabled(false);
    // This is needed to focus on the input field after it is enabled
    // We need to wait for the input field to be rendered before we can focus on it
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleCancel = (): void => {
    setIsInputDisabled(true);
    updateCurrentValue(previousValueRef.current);
  };

  const handleSubmit = (): void => {
    setIsInputDisabled(true);
    if (onSubmit) {
      onSubmit(currentValue).catch((error: unknown) => {
        const msg = error instanceof Error ? error.message : String(error);
        console.log(msg);
        toast.error('Failed to update value');
        updateCurrentValue(previousValueRef.current);
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleSubmit();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <InputGroup className="">
      <InputGroup.Text>{symbol}</InputGroup.Text>
      <Form.Control
        style={{ textAlign: 'left', fontSize: '0.95rem' }}
        ref={inputRef}
        disabled={isInputDisabled}
        aria-label="Amount"
        onChange={handleChange}
        type="number"
        value={currentValue}
        min="0"
        onKeyDown={handleKeyDown}
      />
      {isInputDisabled ? (
        <Button
          variant="outline-secondary"
          id="edit-button"
          onClick={handleEdit}
          aria-label="Edit amount"
          title="Edit amount"
        >
          <i className="bi bi-pencil" aria-hidden="true"></i>
        </Button>
      ) : (
        <>
          <Button
            variant="outline-danger"
            id="cancel-button"
            onClick={handleCancel}
            aria-label="Cancel edit"
            title="Cancel edit"
          >
            <i className="bi bi-x" aria-hidden="true"></i>
          </Button>
          <Button
            variant="outline-success"
            id="submit-button"
            onClick={handleSubmit}
            aria-label="Submit amount"
            title="Submit amount"
          >
            <i className="bi bi-check" aria-hidden="true"></i>
          </Button>
        </>
      )}
    </InputGroup>
  );
};
