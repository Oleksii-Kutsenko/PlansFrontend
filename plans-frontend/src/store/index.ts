import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '../features/auth/slices/authSlice';
import { apiSlice } from './api/apiSlice';

export * from '../features/auth/slices/authSlice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  // eslint-disable-next-line unicorn/prefer-spread
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
