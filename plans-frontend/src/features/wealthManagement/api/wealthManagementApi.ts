import { apiSlice } from '@/store/api/apiSlice.js';

import type { UpdateAssetAllocation, WealthManagementModel } from '../types/interfaces.ts';
import { computeDelta } from '../utils/compute';

export type {
  Allocation,
  AssetAllocation,
  Currency,
  WealthManagementModel,
} from '@/features/wealthManagement/types/interfaces';

export const wealthManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchWealthManagement: builder.query<WealthManagementModel, number>({
      query: (wealthManagementId) => `/api/assets/wealth-management/${String(wealthManagementId)}`,
      // Computed delta logic runs once and is stored in the cache
      transformResponse: (response: WealthManagementModel) => computeDelta(response),
      providesTags: ['WealthManagement'],
    }),

    updateAssetAllocation: builder.mutation<
      UpdateAssetAllocation,
      { assetAllocationId: number; assetAllocation: UpdateAssetAllocation }
    >({
      query: ({ assetAllocationId, assetAllocation }) => ({
        url: `/api/assets/asset-allocation/${String(assetAllocationId)}/`,
        method: 'PATCH',
        body: assetAllocation,
      }),
      // Automatically refetches fetchWealthManagement after a successful mutation
      invalidatesTags: ['WealthManagement'],
    }),
  }),
});

export const { useFetchWealthManagementQuery, useUpdateAssetAllocationMutation } =
  wealthManagementApi;
