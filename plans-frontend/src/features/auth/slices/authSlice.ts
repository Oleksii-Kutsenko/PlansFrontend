import { createSlice } from '@reduxjs/toolkit';

interface State {
  isAuthenticated: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Slice creation

const initialState: State = createInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state): void {
      state.isAuthenticated = true;
    },
    logout(state): void {
      state.isAuthenticated = false;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    },
  },
});

// Exports

export const { logout, loginSuccess } = authSlice.actions;
export const authReducer = authSlice.reducer;

// Implementation

function createInitialState(): State {
  return {
    isAuthenticated: Boolean(localStorage.getItem('access')),
  };
}
