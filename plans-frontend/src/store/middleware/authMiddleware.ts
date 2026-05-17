import { isRejected, isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';

import { logout } from '../slices/auth';

interface AuthErrorPayload {
  status?: number;
  response?: {
    status?: number;
  };
}

export const unauthorizedMiddleware: Middleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isRejectedWithValue(action)) {
      const payload = action.payload as AuthErrorPayload | string | undefined;
      let isUnauthorized = false;

      if (typeof payload === 'string') {
        isUnauthorized = payload.includes('401');
      } else if (payload && typeof payload === 'object') {
        isUnauthorized = payload.status === 401 || payload.response?.status === 401;
      }

      if (isUnauthorized) {
        dispatch(logout());
      }
    } else if (isRejected(action)) {
      const error = action.error;
      let isUnauthorized = false;
      if (error && typeof error.message === 'string') {
        isUnauthorized = error.message.includes('401');
      }

      // Also check payload if available
      if (!isUnauthorized && 'payload' in action) {
        const payload = action.payload as AuthErrorPayload | undefined;
        if (payload && typeof payload === 'object') {
          isUnauthorized = payload.status === 401 || payload.response?.status === 401;
        }
      }

      if (isUnauthorized) {
        dispatch(logout());
      }
    }

    return next(action);
  };
