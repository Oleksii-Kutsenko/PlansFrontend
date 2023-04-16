import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from './slices/auth';
import { countriesReducer } from './slices/countries';
import { countriesOptionsReducer } from './slices/countriesOptions';
import { userReducer } from './slices/user';

export * from './slices/auth';
export * from './slices/user';

const store = configureStore({
  reducer: {
    auth: authReducer,
    countries: countriesReducer,
    countriesOptions: countriesOptionsReducer,
    user: userReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
