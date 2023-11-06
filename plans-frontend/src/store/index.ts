import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from './slices/auth';
import { countriesReducer } from './slices/countries';
import { countriesOptionsReducer } from './slices/countriesOptions';
import { userReducer } from './slices/user';
import { portfoliosReducer } from './slices/portfolios';
import { wealthManagementReducer } from './slices/wealthManagement/';

export * from './slices/auth';
export * from './slices/countries';
export * from './slices/countriesOptions';
export * from './slices/user';
export * from './slices/portfolios';
export * from './slices/wealthManagement';

const store = configureStore({
  reducer: {
    auth: authReducer,
    countries: countriesReducer,
    countriesOptions: countriesOptionsReducer,
    portfolios: portfoliosReducer,
    userInfo: userReducer,
    wealthManagement: wealthManagementReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
