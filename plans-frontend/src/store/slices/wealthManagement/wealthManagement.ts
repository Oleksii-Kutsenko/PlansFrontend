import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetcher } from '../../../utils/axios';
import { WealthManagement } from './interfaces';
import { computeDelta } from './compute';

export enum WealthManagementStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
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
  async (wealthManagementId: number) => {
    const { data } = await fetcher.get(`/api/assets/wealth-management/${wealthManagementId}`);
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
        state.wealthManagement = computeDelta(action.payload);
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
export const wealthManagementActions = { ...wealthManagementSlice.actions, fetchWealthManagement };
