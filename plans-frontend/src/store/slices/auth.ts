import { createSelector, createSlice } from '@reduxjs/toolkit';

interface State {
  token: string;
  refreshToken: string;
  isAuthenticated: boolean;
}

const initialState: State = {
  token: localStorage.getItem('access') ?? '',
  refreshToken: localStorage.getItem('refresh') ?? '',
  isAuthenticated: Boolean(localStorage.getItem('access'))
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: { payload: { access: string; refresh: string } }) {
      state.token = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.isAuthenticated = true;
      localStorage.setItem('access', action.payload.access);
      localStorage.setItem('refresh', action.payload.refresh);
    },
    logout(state) {
      state.token = '';
      state.refreshToken = '';
      state.isAuthenticated = false;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    }
  }
});

const selectAuthState = (state: { auth: State }): State => state.auth;

export const getToken = createSelector(selectAuthState, (auth) => auth.token);

export default authSlice;
