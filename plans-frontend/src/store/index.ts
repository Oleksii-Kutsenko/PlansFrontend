import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from './api/apiSlice';
import { authReducer } from './slices/auth';
import { clothingReducer } from './slices/clothing';
import { countriesReducer } from './slices/countries';
import { countriesOptionsReducer } from './slices/countriesOptions';
import { portfoliosReducer } from './slices/portfolios';
import { wealthManagementReducer } from './slices/wealthManagement/';

export * from './slices/auth';
export * from './slices/clothing';
export * from './slices/countries';
export * from './slices/countriesOptions';
export * from './slices/portfolios';
export * from './slices/wealthManagement';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    countries: countriesReducer,
    clothing: clothingReducer,
    countriesOptions: countriesOptionsReducer,
    portfolios: portfoliosReducer,
    wealthManagement: wealthManagementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
