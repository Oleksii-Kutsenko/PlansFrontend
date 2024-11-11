import { createSelector, createSlice } from '@reduxjs/toolkit';

interface State {
  token: string;
  refreshToken: string;
  isAuthenticated: boolean;
}

const initialState: State = createInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action): void {
      const { access, refresh } = action.payload;
      state.token = access;
      state.refreshToken = refresh;
      state.isAuthenticated = true;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
    },
    logout(state): void {
      state.token = '';
      state.refreshToken = '';
      state.isAuthenticated = false;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    }
  }
});

// Exports

export const { setToken, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

// Selectors

const selectAuthState = (state: { auth: State }): State => state.auth;

export const getToken = createSelector(selectAuthState, (auth) => auth.token);

// Implementation

function createInitialState(): State {
  return {
    token: localStorage.getItem('access') ?? '',
    refreshToken: localStorage.getItem('refresh') ?? '',
    isAuthenticated: Boolean(localStorage.getItem('access'))
  };
}
