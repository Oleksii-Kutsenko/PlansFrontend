import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/auth';
import countriesSlice from './slices/countries';
import countriesOptionsSlice from './slices/countriesOptions';

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    countries: countriesSlice.reducer,
    countriesOptions: countriesOptionsSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
