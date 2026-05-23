import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from './api/apiSlice';
import { authReducer } from './slices/auth';

export * from './slices/auth';
export * from './slices/wealthManagement';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => [...getDefaultMiddleware(), apiSlice.middleware],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
