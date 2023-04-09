import { configureStore } from '@reduxjs/toolkit';
import TokenSlice from './TokenSlice';

const store = configureStore({
  reducer: {
    token: TokenSlice
  }
});

export default store;
