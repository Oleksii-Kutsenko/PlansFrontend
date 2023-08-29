import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';

export enum WealthManagementStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

interface WealthManagement {
  allocations: any[];
}

interface State {
  wealthManagement: WealthManagement | undefined;
  status: WealthManagementStatus;
}

const initialState: State = {
  wealthManagement: undefined,
  status: WealthManagementStatus.IDLE
};

// Thunk
export const fetchWealthManagement = createAsyncThunk(
  'wealthManagement/fetchWealthManagement',
  async () => {
    const { data } = await fetcher.get('/api/assets/wealth-management/');
    return data;
  }
);

// Slice
const wealthManagementSlice = createSlice({
  name: 'wealthManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWealthManagement.fulfilled, (state, action) => {
        state.wealthManagement = action.payload;
        state.status = WealthManagementStatus.SUCCEEDED;
      })
      .addCase(fetchWealthManagement.pending, (state) => {
        state.status = WealthManagementStatus.LOADING;
      })
      .addCase(fetchWealthManagement.rejected, (state) => {
        state.status = WealthManagementStatus.FAILED;
      });
  }
});

// Exports
export const wealthManagementReducer = wealthManagementSlice.reducer;
