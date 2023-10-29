import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';

export enum WealthManagementStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

interface Currency {
  name: string;
  symbol: string;
}

interface Asset {
  name: string;
  currency: Currency;
}

interface AssetAllocation {
  name: string;
  asset: Asset;
  current_amount: number;
  target_amount: number;
  target_percentage: number;
  difference: number;
}

export interface Allocation {
  asset_allocations: AssetAllocation[];
  asset_type: { name: string };
  current_amount: number;
  target_amount: number;
  target_percentage: number;
}

interface WealthManagement {
  allocations: Allocation[];
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
export const wealthManagementActions = { ...wealthManagementSlice.actions, fetchWealthManagement };
