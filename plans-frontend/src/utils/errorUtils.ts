import { FieldValues, Path, type UseFormSetError } from 'react-hook-form';
import { toast } from 'react-toastify';

export const handleApiFormError = <T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  defaultMessage = 'An error occurred',
): void => {
  console.error(defaultMessage, error);

  const isApiError = error != null && typeof error === 'object' && 'data' in error;
  const errorData = (isApiError ? error.data : error) as Record<string, unknown>;

  const errorMessage =
    typeof errorData.errorMessage === 'string' ? errorData.errorMessage : defaultMessage;

  toast.error(errorMessage);

  for (const field in errorData) {
    if (field === 'errorMessage') continue;
    const messages = errorData[field];
    if (Array.isArray(messages)) {
      for (const message of messages) {
        if (typeof message === 'string') {
          toast.error(`${field}: ${message}`);

          setError(field as Path<T>, {
            type: 'custom',
            message,
          });
        }
      }
    }
  }
};
