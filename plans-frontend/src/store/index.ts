import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from './slices/auth';
import { clothingReducer } from './slices/clothing';
import { countriesReducer } from './slices/countries';
import { countriesOptionsReducer } from './slices/countriesOptions';
import { portfoliosReducer } from './slices/portfolios';
import { userReducer } from './slices/user';
import { wealthManagementReducer } from './slices/wealthManagement/';

export * from './slices/auth';
export * from './slices/clothing';
export * from './slices/countries';
export * from './slices/countriesOptions';
export * from './slices/portfolios';
export * from './slices/user';
export * from './slices/wealthManagement';

const store = configureStore({
  reducer: {
    auth: authReducer,
    countries: countriesReducer,
    clothing: clothingReducer,
    countriesOptions: countriesOptionsReducer,
    portfolios: portfoliosReducer,
    userInfo: userReducer,
    wealthManagement: wealthManagementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
