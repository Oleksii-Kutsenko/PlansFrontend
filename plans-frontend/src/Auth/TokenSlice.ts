import { createSlice } from '@reduxjs/toolkit';

export const getToken = (state: { token: null; isAuthenticated: boolean }): string | null =>
  state.token;

const initialState = {
  token: localStorage.getItem('access'),
  isAuthenticated: Boolean(localStorage.getItem('access'))
};

const TokenSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    clearToken(state) {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access');
    }
  }
});

export const { setToken, clearToken } = TokenSlice.actions;

export default TokenSlice.reducer;
