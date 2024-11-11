import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetcher } from '../../../utils/axios';
import { WealthManagementModel, UpdateAssetAllocation } from './interfaces';
import { computeDelta } from './compute';
import { LoadingStatus } from '../utils';

const name = 'wealthManagement';

interface State {
  wealthManagement: WealthManagementModel | undefined;
  wealthManagementChanged: boolean;
  status: LoadingStatus;
}

const initialState: State = {
  wealthManagement: undefined,
  wealthManagementChanged: false,
  status: LoadingStatus.IDLE
};

// Thunk
export const fetchWealthManagement = createAsyncThunk(
  `${name}/fetchWealthManagement`,
  async (wealthManagementId: number) => {
    const { data } = await fetcher.get(`/api/assets/wealth-management/${wealthManagementId}`);
    return data;
  }
);

export const updateAssetAllocation = createAsyncThunk<
  UpdateAssetAllocation,
  { assetAllocationId: number; assetAllocation: UpdateAssetAllocation }
>(
  `${name}/updateAssetAllocation`,
  async ({ assetAllocationId, assetAllocation: assetAllocation }) => {
    const { data } = await fetcher.patch(
      `/api/assets/asset-allocation/${assetAllocationId}/`,
      assetAllocation
    );
    return data;
  }
);

// Slice
const wealthManagementSlice = createSlice({
  name: name,
  initialState,
  reducers: {
    setWealthManagement: (state, action) => {
      state.wealthManagement = action.payload;
    },
    setWealthManagementChanged: (state, action) => {
      state.wealthManagementChanged = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWealthManagement.fulfilled, (state, action) => {
        state.wealthManagement = computeDelta(action.payload);
        state.status = LoadingStatus.SUCCEEDED;
      })
      .addCase(fetchWealthManagement.pending, (state) => {
        state.status = LoadingStatus.LOADING;
      })
      .addCase(fetchWealthManagement.rejected, (state) => {
        state.status = LoadingStatus.FAILED;
      })
      .addCase(updateAssetAllocation.fulfilled, (state) => {
        state.wealthManagementChanged = true;
      });
  }
});

// Exports
export const wealthManagementReducer = wealthManagementSlice.reducer;
export const wealthManagementActions = {
  ...wealthManagementSlice.actions,
  fetchWealthManagement,
  updateAssetAllocation
};
