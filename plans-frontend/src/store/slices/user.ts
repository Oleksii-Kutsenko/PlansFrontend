import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';

interface User {
  birthDate: string;
  country: string;
  isAdmin: boolean;
  username: string;
  wealthManagementID: number;
}

interface State {
  user: User | null;
  userLoading: boolean;
}

const name = 'user';

// Thunk
export const fetchCurrentUser = createAsyncThunk(
  `${name}/fetchCurrentUser`,
  async (): Promise<User> => {
    const response = await fetcher.get('/api/accounts/user/');
    return response.data;
  }
);

// Initial state
const initialState: State = {
  user: null,
  userLoading: false
};

// Slice
const userSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.userLoading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.userLoading = false;
      });
  }
});

// Exports
export const userReducer = userSlice.reducer;
export const userActions = { ...userSlice.actions, fetchCurrentUser };
